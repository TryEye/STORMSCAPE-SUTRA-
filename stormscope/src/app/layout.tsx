import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Header, Footer, DemoGuide } from "@/components/layout";
import { DataRegistryProvider } from "@/context/DataRegistryContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "StormScope — Historical Cyclone Exposure Assessment",
  description:
    "Historical Cyclone Exposure Assessment and Infrastructure Planning Platform. Explore cyclone impacts, hazard visualizations, and infrastructure exposure for Odisha, India.",
  keywords: [
    "cyclone",
    "exposure assessment",
    "infrastructure planning",
    "geospatial",
    "Odisha",
    "Cyclone Fani",
    "hazard mapping",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DataRegistryProvider>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <DemoGuide />
        </DataRegistryProvider>
      </body>
    </html>
  );
}
