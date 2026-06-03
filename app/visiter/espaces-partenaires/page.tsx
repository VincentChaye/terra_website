import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Espaces Partenaires Terra Numerica",
  description:
    "Un réseau de 26 Espaces Partenaires Terra Numerica répartis sur 4 départements en Région Sud.",
  alternates: { canonical: "/visiter/espaces-partenaires" },
};

export default function EspacesPartenairesPage() {
  return (
    <div>
      <PageHeader
        title="Espaces Partenaires Terra Numerica"
        description="Terra Numerica développe un réseau d'espaces de médiation scientifique et numérique à travers tout le territoire."
        breadcrumb={[{ label: "Visiter", href: "/visiter" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Animé par la conviction que la science doit aller à la rencontre de tous les citoyens,
          Terra Numerica développe (avec ses partenaires) des Espaces Partenaires Terra Numerica
          (EPTN) à travers tout le territoire. Un EPTN est un lieu (qui peut être une partie d&apos;une
          infrastructure physique ou l&apos;infrastructure elle-même) avec éventuellement son environnement
          associé hors murs, géré par une structure porteuse Partenaire de Terra Numerica
          (établissement scolaire, association, médiathèque, etc.) en charge d&apos;y mener des activités
          régulières de médiation scientifique et numérique.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Un réseau de 26 EPTN</h2>

        <p className="text-white/85">
          Fin 2020 une fiche de description d&apos;un EPTN a été élaborée. Fin 2021 un document
          d&apos;engagement mutuel entre Terra Numerica et la structure porteuse a été élaboré.
        </p>

        <p className="text-white/85">
          2021 fût l&apos;année de démarrage du réseau des EPTN. Actuellement nous comptons 26 EPTN
          répartis sur 4 départements : 19 dans les Alpes-Maritimes (06), 5 dans le Var (83), 1 dans
          le Vaucluse (84) et 1 dans les Alpes de Haute Provence (04), portés par des structures
          différentes : 2 EPTN Fab&apos;Ecoles, 2 EPTN centres de formation (Inspe de Nice), 15 EPTN
          scolaires (collèges et lycée), 4 EPTN associatifs, 2 médiathèques et 1 lieu d&apos;art.
        </p>

        <p className="text-white/85">
          Si vous souhaitez plus d&apos;informations ou si vous souhaitez être accompagné afin que votre
          établissement/structure obtienne le statut d&apos;Espace Partenaire Terra Numerica, nous vous
          invitons à nous écrire :{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>

        <p className="text-white/85">
          Terra Numerica organise et participe à plus de 350 événements chaque année sur l&apos;ensemble
          de la Région Sud et au-delà, permettant de découvrir, explorer et expérimenter les sciences
          du numérique en classe, chez soi ou lors d&apos;événements de type Fête de la Science.
        </p>
      </div>
    </div>
  );
}
