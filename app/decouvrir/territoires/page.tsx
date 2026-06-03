import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Développement territorial — Terra Numerica",
  description:
    "Terra Numerica développe des réseaux interconnectés d'Espaces de Culture Numérique en Région Sud et au-delà.",
  alternates: { canonical: "/decouvrir/territoires" },
};

export default function TerritoiresPage() {
  return (
    <div>
      <PageHeader
        title="Développement territorial"
        breadcrumb={[{ label: "Découvrir", href: "/decouvrir" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-white/85 leading-relaxed">
          Terra Numerica développe des réseaux interconnectés d&apos;Espaces de Culture Numérique,
          chacun couvrant un territoire ciblé avec un possible lieu-totem agissant comme un pôle de
          rayonnement, et intégrant des communautés apprenantes. L&apos;ensemble des territoires est très
          dynamique et s&apos;affine au fur et à mesure des développements :
        </p>
        <ul className="list-disc list-inside space-y-1 text-white/85 mt-4">
          <li>Sophia Antipolis et académie de Nice/Centre en Région Sud</li>
          <li>Nice, Métropole Nice Côte d&apos;Azur et académie de Nice/Est en Région Sud</li>
          <li>Var et académie de Nice/Ouest en Région Sud</li>
          <li>Marseille et académie d&apos;Aix-Marseille en Région Sud</li>
          <li>Nouvelle-Calédonie</li>
          <li>Corse</li>
        </ul>
      </div>
    </div>
  );
}
