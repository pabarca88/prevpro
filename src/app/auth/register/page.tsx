"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  useEffect(() => { getCsrfToken().then(t => t && setCsrfToken(t)); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, csrfToken }),
    });
    setLoading(false);
    if (res.ok) router.push("/auth/login");
    else setError((await res.json()).error || "Error al registrar usuario");
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Crear cuenta
        </h1>

        <input
          type="text"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          required
        />

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          {loading ? "Registrando..." : "Registrarme"}
        </button>

        <p className="mt-6 text-sm text-center text-gray-700">
          ¿Ya tienes cuenta?{" "}
          <a href="/auth/login" className="text-blue-600 font-medium hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </main>
  );
}
