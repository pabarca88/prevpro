import "./globals.css";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const metadata = {
  title: "Plataforma",
  description: "Gestión documental",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-200 text-gray-900">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
