import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { getNewsletters } from "@/lib/content";

export const metadata: Metadata = {
  title: "La lettre Terra Numerica",
  description:
    "Une lettre d'information mensuelle pour suivre l'actualité de Terra Numerica, depuis décembre 2020.",
  alternates: { canonical: "/actualites/newsletter" },
};

export default function NewsletterPage() {
  const letters = getNewsletters(); // tri par date desc, synchrone → page statique

  return (
    <div>
      <PageHeader
        title="La lettre Terra Numerica"
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Une lettre d&apos;information mensuelle a vu le jour en décembre 2020. Elle vous permet de
          suivre l&apos;actualité de Terra Numerica. Nous vous proposons de les retrouver sur cette
          page au fur et à mesure de leur parution. S&apos;inscrire à la liste de diffusion.
        </p>

        {letters.map((letter) => (
          <section key={letter.id}>
            <h2 className="text-xl font-bold text-white mt-8 mb-3">{letter.title}</h2>
            <p className="text-white/85 leading-relaxed">{letter.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
