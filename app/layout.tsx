import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCM - Sistema de Controle de Materiais",
  description: "Sistema moderno de gestão de estoque e movimentos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} bg-white dark:bg-slate-950 transition-colors overflow-hidden`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
