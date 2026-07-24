import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Modules médiations pour les scolaires et jeunes — Terra Numerica",
  description:
    "Terra Numerica propose des modules pour les scolaires (de la maternelle au supérieur) et les publics jeunes : Déclic, Exploratoire, Expédition.",
  alternates: { canonical: "/scolaires/offre" },
};

export default function ScorairesOffrePage() {
  return (
    <div>
      <PageHeader
        title="Modules médiations pour les scolaires et jeunes"
        description="Des modules pédagogiques conçus par Terra Numerica pour les scolaires de la maternelle au supérieur et les publics jeunes."
        breadcrumb={[{ label: "Scolaires", href: "/scolaires" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Terra Numerica propose des modules pour les scolaires (de la maternelle au supérieur) et
          les publics jeunes issus de structures associatives ou de collectivités (périscolaires,
          centres de loisirs, etc.). Trois modules sont disponibles : Déclic, Exploratoire,
          Expédition. Ces actions sont proposées dans tous les territoires (en particulier au sein des
          lieux-totems comme Terra Numerica Sophia et au sein des Espaces Partenaires Terra Numerica).
          Vous souhaitez mettre en place un des modules Terra Numerica, merci de nous écrire :{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>

        <p className="text-white/85">
          Pour l&apos;ensemble des modules, l&apos;option combinée peut être proposée. Le principe est simple :
          dans le cadre d&apos;une visite scientifique, une première classe visite le lieu scientifique d&apos;un
          partenaire le matin et Terra Numerica l&apos;après-midi, la deuxième classe effectue le parcours
          dans l&apos;autre sens.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Module Déclic</h2>

        <p className="text-white/85">
          Il s&apos;agit d&apos;une visite découverte de deux heures. Les élèves d&apos;une classe effectuent
          typiquement des parcours d&apos;ateliers en demi-groupe. La visite est personnalisée : les
          thématiques sont choisies lors de la préparation de l&apos;événement et les ateliers sont adaptés
          au niveau (de la grande section de maternelle au supérieur, périscolaire, centres de
          loisirs). Il peut également être proposé une participation à un forum des métiers ou des
          conférences interactives.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Module Exploratoire</h2>

        <p className="text-white/85">
          Il s&apos;agit de plusieurs sessions de médiation (parcours d&apos;ateliers ludiques, conférences
          interactives, participation à un forum des métiers) venant s&apos;inscrire en complémentarité
          d&apos;un cursus pour une même classe ou un même groupe.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Module Expédition</h2>

        <p className="text-white/85">
          Il s&apos;agit de l&apos;accompagnement d&apos;une classe à la mise en œuvre d&apos;un projet pédagogique dans
          le domaine du numérique. Ce module comprend au minimum trois interventions, un suivi durant
          la période du projet (une année scolaire typiquement) et une restitution permettant aux
          élèves ou aux groupes de jeunes de devenir à leur tour passeurs de sciences.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Événements phares au sein des territoires
        </h2>

        <ul className="space-y-2 text-white/85 list-disc list-inside">
          <li>
            <span className="font-medium">Semaine des maths en mars</span> : de nombreuses actions
            pour les scolaires et les personnels enseignants sur tout le territoire pendant la semaine
            contenant le 14 mars.
          </li>
          <li>
            <span className="font-medium">
              Semaine du numérique éducatif de Nouvelle-Calédonie chaque printemps
            </span>
            .
          </li>
          <li>
            <span className="font-medium">
              Forum des maths de Porto-Vecchio chaque printemps
            </span>{" "}
            : deux jours pour faire découvrir et expérimenter les sciences aux élèves de l&apos;académie
            de Corse.
          </li>
          <li>
            <span className="font-medium">
              Semaine du numérique Valbonne Sophia Antipolis chaque printemps
            </span>
            .
          </li>
        </ul>

        {/* CTA */}
        <div className="pt-6 text-center border-t border-white/20 mt-8">
          <Link
            href="/scolaires/reserver"
            className="inline-block px-8 py-3 rounded font-semibold bg-tn-blue text-white hover:bg-[#1a8fd1] transition-colors"
          >
            Réserver une visite
          </Link>
        </div>
      </div>
    </div>
  );
}
