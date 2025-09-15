import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareSight - AI Wellness Assistant",
  description: "AI-powered wellness assistant for chronic diseases. Predictive health intelligence for diabetes, hypertension, and heart disease.",
  keywords: "AI health, wellness assistant, chronic disease management, diabetes, hypertension, heart disease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${nunito.variable} antialiased font-inter`}
      >
        {children}
      </body>
    </html>
  );
}
