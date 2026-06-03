import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Événements et Médiations grand public — Terra Numerica",
  description:
    "Terra Numerica organise et participe à des événements à destination du grand public tout au long de l'année en Région Sud.",
  alternates: { canonical: "/visiter/agenda" },
};

export default function AgendaPage() {
  return (
    <div>
      <PageHeader
        title="Événements et Médiations grand public"
        description="Terra Numerica organise et participe à des événements à destination du grand public tout au long de l'année."
        breadcrumb={[{ label: "Visiter", href: "/visiter" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Terra Numerica organise et participe à des événements à destination du grand public.
          Certains d&apos;entre eux font l&apos;objet d&apos;une inscription en ligne obligatoire. Une question ?
          Une demande ?{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Vivez l&apos;expérience du numérique chaque 1er samedi du mois (14h-18h) à Terra Numerica Sophia
        </h2>

        <p className="text-white/85">
          Plongez en famille, entre amis ou en solo dans une expérience scientifique et ludique
          unique, où la recherche et la technologie se vivent à travers le jeu et l&apos;échange. Chaque
          mois, une nouvelle thématique vous invite à rencontrer l&apos;écosystème sophipolitain, ses
          passionnés et ses chercheurs.
        </p>

        <p className="text-white/85">
          Pour tous, dès 7 ans : Que vous soyez débutant, adolescent, adulte, professionnel de la
          tech ou curieux de ce secteur et de ses innovations, venez explorer et expérimenter dans un
          espace convivial et stimulant. Ici, vous n&apos;êtes pas un simple usager, mais un acteur de
          l&apos;aventure numérique ! Cette expérience se vivant ensemble, les plus jeunes doivent être
          accompagnés de leur parent. Nos ateliers pédagogiques sont conçus pour être
          intergénérationnels, ils sont cependant adaptés pour toutes les personnes âgées de 7 ans et
          plus.
        </p>

        <p className="text-white/85 font-semibold">C&apos;est gratuit sur inscription.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Terra Numerica Connect : « S&apos;informer, partager et penser ensemble le numérique de demain »
        </h2>

        <p className="text-white/85">
          Venez à la rencontre de professionnels, chercheurs et citoyens qui souhaitent autant
          transmettre que créer un espace de discussions pour que chacun(e) puisse être acteur du
          monde fascinant du numérique qui nous entoure. Des sujets multiples seront abordés à
          travers des formats interactifs et ludiques tout au long de l&apos;année.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Ateliers ludiques, conférence, forum des métiers tout au long de l&apos;année en Région Sud
        </h2>

        <p className="text-white/85">
          Terra Numerica déploie des parcours d&apos;ateliers ludiques (par exemple au sein de
          médiathèques, ludothèques), propose des conférences pour le grand public et participe
          régulièrement à des forums des métiers et des actions contribuant à promouvoir les métiers
          du numérique.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Événements phares au sein des territoires
        </h2>

        <ul className="space-y-2 text-white/85 list-disc list-inside">
          <li>
            <span className="font-medium">World Artificial Intelligence Cannes Festival (WAICF) en février</span> :
            Terra Numerica déploie des ateliers ludiques IA en partenariat avec 3IA Côte d&apos;Azur et
            la Région Sud.
          </li>
          <li>
            <span className="font-medium">Semaine du numérique Valbonne Sophia Antipolis chaque printemps</span> :
            une grande fête du numérique pendant six jours. Du lundi au samedi, des parcours
            d&apos;activités sont proposés aux scolaires et au grand public notamment.
          </li>
          <li>
            <span className="font-medium">Journées européennes du patrimoine en septembre</span> :
            un programme riche autour de la découverte de l&apos;informatique et de son histoire.
          </li>
          <li>
            <span className="font-medium">Village des sciences du numérique</span>. Expérimentez le
            numérique tout un week-end à Terra Numerica Sophia. Cinq créneaux d&apos;ouverture : premier
            week-end d&apos;octobre.
          </li>
          <li>
            <span className="font-medium">Fête de la science en Région Sud en octobre</span>. Terra
            Numerica participe à de nombreux villages des sciences : Aix-en-Provence, Antibes
            Juan-les-Pins, Grasse, Mouans-Sartoux, Nice, Valbonne Sophia Antipolis, Villeneuve-Loubet,
            Vinon-sur-Verdon.
          </li>
          <li>
            <span className="font-medium">Semaine du numérique et des sciences informatiques en décembre</span>.
          </li>
        </ul>
      </div>
    </div>
  );
}
