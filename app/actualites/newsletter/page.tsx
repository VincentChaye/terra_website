import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "La lettre Terra Numerica",
  description:
    "Une lettre d'information mensuelle pour suivre l'actualité de Terra Numerica, depuis décembre 2020.",
  alternates: { canonical: "/actualites/newsletter" },
};

export default function NewsletterPage() {
  return (
    <div>
      <PageHeader
        title="La lettre Terra Numerica"
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Une lettre d&apos;information mensuelle a vu le jour en décembre 2020. Elle vous permet de suivre
          l&apos;actualité de Terra Numerica. Nous vous proposons de les retrouver sur cette page au fur et à mesure de
          leur parution. S&apos;inscrire à la liste de diffusion.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Lettre de mai 2026</h2>
        <p className="text-white/85 leading-relaxed">
          Grâce à l&apos;engagement des forces vives des territoires, des dizaines de milliers de personnes
          expérimentent le numérique (dont l&apos;IA) chaque année. Plus de 330 classes (de l&apos;élémentaire aux
          cursus post-baccalauréat) ont déjà pratiqué des activités de Terra Numerica durant l&apos;année scolaire
          2025-2026.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Lettre de janvier 2026</h2>
        <p className="text-white/85 leading-relaxed">
          Grâce à l&apos;engagement des forces vives des territoires, des dizaines de milliers de personnes
          expérimentent le numérique (dont l&apos;IA) chaque année. Pour cette 42e lettre, nous vous proposons de
          découvrir la programmation grand public ainsi que les stages du premier semestre 2026.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Lettre de novembre 2025</h2>
        <p className="text-white/85 leading-relaxed">
          Grâce à l&apos;engagement des forces vives des territoires, ce sont plus de 100 000 personnes qui ont
          expérimenté le numérique dont l&apos;IA grâce aux dispositifs Terra Numerica depuis 2022.
        </p>
      </div>
    </div>
  );
}
