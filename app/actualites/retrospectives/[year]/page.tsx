import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { getRetrospective, getRetrospectives } from "@/lib/content";

type Props = { params: Promise<{ year: string }> };

/** Génère une page statique pour chaque année présente dans retrospectives.json */
export async function generateStaticParams() {
  return getRetrospectives().map((r) => ({ year: String(r.year) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Rétrospective ${year} — Terra Numerica`,
    description: `Bilan des actions et événements Terra Numerica pour l'année ${year}.`,
    alternates: { canonical: `/actualites/retrospectives/${year}` },
  };
}

export default async function RetrospectivePage({ params }: Props) {
  const { year } = await params;
  const retro = getRetrospective(Number(year));

  if (!retro) notFound();

  return (
    <div>
      <PageHeader
        title={`Rétrospective ${year}`}
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {retro.intro && (
          <p className="text-white/85 leading-relaxed font-medium">{retro.intro}</p>
        )}
        {retro.paragraphs.map((p, i) => (
          <p key={i} className="text-white/85 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
