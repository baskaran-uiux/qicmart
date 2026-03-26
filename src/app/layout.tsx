import type { Metadata } from "next";
import { Inter, Outfit, Montserrat, Poppins, Playfair_Display, Open_Sans, Ubuntu, Lato } from "next/font/google"; 
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-poppins" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const opensans = Open_Sans({ subsets: ["latin"], variable: "--font-opensans" });
const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--font-ubuntu" });
const lato = Lato({ subsets: ["latin"], weight: ["100", "300", "400", "700", "900"], variable: "--font-lato" });

export const metadata: Metadata = {
  title: "Qicmart SaaS",
  description: "Your modern e-commerce platform",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${montserrat.variable} ${poppins.variable} ${playfair.variable} ${opensans.variable} ${ubuntu.variable} ${lato.variable} font-sans bg-background text-foreground antialiased transition-colors duration-300`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </Providers>
      </body>
    </html>
  );
}
