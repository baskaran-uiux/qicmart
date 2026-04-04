import type { Metadata } from "next";
import { Inter, Outfit, Montserrat, Poppins, Playfair_Display, Open_Sans, Ubuntu, Lato, JetBrains_Mono } from "next/font/google"; 
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
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Qicmart | Launch & Scale Your E-Commerce Store Instantly",
    template: "%s | Qicmart Platform"
  },
  description: "Qicmart is the ultimate all-in-one SaaS platform to build, manage, and scale your high-performance online store. Create professional e-commerce websites with zero coding, integrated AI tools, and global infrastructure.",
  keywords: ["e-commerce platform", "online store builder", "SaaS e-commerce", "sell online", "AI storefront", "retail software", "Qicmart", "digital storefront", "dropshipping platform"],
  authors: [{ name: "Qicmart" }],
  creator: "Qicmart Global",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qicmart.com",
    title: "Qicmart | Launch & Scale Your E-Commerce Store",
    description: "Build your dream online store in minutes. Premium e-commerce infrastructure for modern brands.",
    siteName: "Qicmart"
  },
  twitter: {
    card: "summary_large_image",
    title: "Qicmart | The Ultimate E-Commerce Platform",
    description: "Launch your high-performance online store with Qicmart. Zero coding required."
  }
};

import { Toaster } from "sonner";
import { CookieConsent } from "@/components/common/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${montserrat.variable} ${poppins.variable} ${playfair.variable} ${opensans.variable} ${ubuntu.variable} ${lato.variable} ${jetbrains.variable} ${outfit.className} bg-background text-foreground antialiased transition-colors duration-300`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" closeButton />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
