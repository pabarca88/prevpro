// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg mb-4">No estás autenticado.</p>
        <Link href="/auth/login" className="text-blue-600 underline">
          Ir al login
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">
        Bienvenido, {session.user.name || session.user.email}
      </h1>
      <p className="text-gray-600">Sesión iniciada correctamente ✅</p>
      <form action="/api/auth/signout" method="post" className="mt-6">
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
