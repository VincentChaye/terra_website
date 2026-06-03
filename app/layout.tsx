import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "Terra Numerica — Les sciences du numérique à portée de main",
    template: "%s — Terra Numerica",
  },
  description:
    "Terra Numerica est un consortium CNRS/Inria/Université Côte d'Azur pour la culture scientifique et l'éducation au numérique.",
  metadataBase: new URL("https://terra-numerica.org"),
  icons: {
    icon: `${bp}/favicon.png`,
    apple: `${bp}/favicon.png`,
  },
  openGraph: {
    siteName: "Terra Numerica",
    locale: "fr_FR",
    type: "website",
    images: [{ url: `${bp}/logo-tn.png` }],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
