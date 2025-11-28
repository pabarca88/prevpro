import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ratelimit } from "@/lib/ratelimit";

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[a-z]/, "Debe incluir una minúscula")
    .regex(/[0-9]/, "Debe incluir un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo"),
  csrfToken: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0].trim();

    // Rate limit con Upstash
    // const { success } = await ratelimit.limit(ip);
    // if (!success) {
    //   return NextResponse.json(
    //     { error: "Demasiadas solicitudes, intenta nuevamente en un minuto." },
    //     { status: 429 }
    //   );
    // }

    // Validación Zod del cuerpo
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    // Validación CSRF
    const origin = req.headers.get("origin") ?? "";
    const host = req.headers.get("host") ?? "";
    if (!origin.includes(host)) {
      return NextResponse.json({ error: "CSRF detectado: origen inválido" }, { status: 403 });
    }

    // Verificar si existe el email
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json({ error: "El correo ya está registrado." }, { status: 409 });
    }

    // Hash seguro
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    const pepper = process.env.PASSWORD_PEPPER ?? "";
    const hashed = await hash(data.password + pepper, rounds);

    // Crear usuario
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hash: hashed,   // ✔ COINCIDE CON TU MODELO
        role: "CLIENT", // ✔ ENUM correcto
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
