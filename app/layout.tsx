import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sustainability Manager Jobs | Engineering a Sustainable Future",
  description:
    "Connecting engineers, designers, and scientists with high-impact startups building carbon removal, renewable energy, and sustainable infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "scroll-smooth", "antialiased", hankenGrotesk.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
        {children}
      </body>
    </html>
  );
}
