import type { Metadata } from "next";
import ConsentButton from "@/components/ConsentButton";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Terra Numerica",
  description:
    "Traitement de vos données personnelles, vos droits RGPD et politique de gestion des cookies.",
};

/* ── Tableau cookies ─────────────────────────────────────────── */
const cookieCategories = [
  {
    name: "Strictement nécessaires",
    purpose: "Mémorisation du consentement cookies, sécurité de session.",
    examples: "tn_consent (localStorage)",
    duration: "12 mois",
    optional: false,
  },
  {
    name: "Mesure d'audience",
    purpose:
      "Comptage anonyme des pages vues et des sessions pour améliorer le site. Aucune donnée nominative, aucun profil publicitaire. Outil : Plausible Analytics (exemption CNIL n° 39).",
    examples: "Aucun cookie déposé (mesure sans cookie, côté serveur)",
    duration: "Données agrégées conservées 24 mois",
    optional: true,
  },
  {
    name: "Médias externes (YouTube)",
    purpose:
      "Lecture des vidéos Terra Numerica intégrées depuis YouTube/Google. Sans consentement, aucun lecteur vidéo externe n'est chargé.",
    examples: "VISITOR_INFO1_LIVE, YSC, GPS (YouTube/Google)",
    duration: "179 jours à session",
    optional: true,
  },
  {
    name: "Réseaux sociaux",
    purpose:
      "Scripts de partage Facebook, LinkedIn. Permettent le partage de pages vers ces plateformes. Sans consentement, seuls des liens hypertexte sont utilisés.",
    examples: "fr, datr, _fbp (Facebook) · li_gc, lidc (LinkedIn)",
    duration: "3 mois à 2 ans selon la plateforme",
    optional: true,
  },
];

/* ── Page ────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div>
        <h1 className="mb-2">Politique de confidentialité</h1>
        <p className="text-white/50 text-sm">Mise à jour : juin 2026</p>
      </div>

      {/* ── 1. Responsable de traitement ── */}
      <section>
        <h2 className="mb-4">1. Responsable de traitement</h2>
        <p className="text-white/75">
          Le site <strong>terra-numerica.org</strong> est édité par le consortium Terra Numerica,
          dont les membres fondateurs sont :
        </p>
        <ul className="list-disc list-inside text-white/75 mt-2 space-y-1">
          <li>CNRS (Centre National de la Recherche Scientifique)</li>
          <li>Inria (Institut National de Recherche en Sciences et Technologies du Numérique)</li>
          <li>Université Côte d&apos;Azur</li>
        </ul>
        <p className="text-white/75 mt-3">
          Contact : <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">contact@terra-numerica.org</a>
          <br />
          Adresse : 18 rue Frédéric Mistral, 06560 Valbonne
        </p>
      </section>

      {/* ── 2. Données collectées ── */}
      <section>
        <h2 className="mb-4">2. Données personnelles collectées</h2>

        <h3 className="mb-2">Formulaire de réservation scolaires</h3>
        <p className="text-white/75">
          Champs collectés : établissement, nom, prénom, adresse e-mail, téléphone, niveau scolaire, nombre d&apos;élèves, dates souhaitées, message libre.
        </p>
        <ul className="list-disc list-inside text-white/70 mt-2 space-y-1 text-sm">
          <li><strong>Finalité :</strong> organisation des visites et ateliers scolaires.</li>
          <li><strong>Base légale :</strong> exécution d&apos;un contrat (Art. 6.1.b RGPD).</li>
          <li><strong>Durée de conservation :</strong> 3 ans à compter du dernier contact.</li>
        </ul>

        <h3 className="mt-6 mb-2">Formulaire de contact entreprises</h3>
        <p className="text-white/75">
          Champs collectés : entreprise, nom, prénom, adresse e-mail, téléphone, domaine d&apos;intérêt, nombre de participants, message.
        </p>
        <ul className="list-disc list-inside text-white/70 mt-2 space-y-1 text-sm">
          <li><strong>Finalité :</strong> réponse aux demandes de partenariat, team building et formations.</li>
          <li><strong>Base légale :</strong> intérêt légitime (Art. 6.1.f RGPD).</li>
          <li><strong>Durée de conservation :</strong> 3 ans à compter du dernier contact.</li>
        </ul>

        <h3 className="mt-6 mb-2">Navigation et mesure d&apos;audience</h3>
        <p className="text-white/75">
          Si vous acceptez les cookies de mesure d&apos;audience, des données agrégées de navigation
          (page visitée, pays, type d&apos;appareil) sont collectées de manière anonyme via Plausible Analytics.
          Aucune donnée nominative n&apos;est associée à ces statistiques.
        </p>
      </section>

      {/* ── 3. Droits RGPD ── */}
      <section>
        <h2 className="mb-4">3. Vos droits</h2>
        <p className="text-white/75 mb-3">
          Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés, vous disposez des droits suivants :
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { right: "Accès", desc: "Obtenir une copie de vos données." },
            { right: "Rectification", desc: "Corriger des données inexactes." },
            { right: "Effacement", desc: "Supprimer vos données (droit à l'oubli)." },
            { right: "Opposition", desc: "Vous opposer à un traitement basé sur l'intérêt légitime." },
            { right: "Limitation", desc: "Limiter temporairement un traitement." },
            { right: "Portabilité", desc: "Recevoir vos données dans un format structuré." },
          ].map((r) => (
            <div key={r.right} className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-white text-sm font-semibold">{r.right}</p>
              <p className="text-white/55 text-xs mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-white/65 text-sm mt-4">
          Pour exercer vos droits, écrivez à{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>. En cas de désaccord, vous pouvez saisir la{" "}
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-tn-blue hover:underline">
            CNIL
          </a>.
        </p>
      </section>

      {/* ── 4. Cookies ── */}
      <section id="cookies">
        <h2 className="mb-2">4. Cookies et traceurs</h2>
        <p className="text-white/75 mb-6">
          Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite. Certains sont
          indispensables au fonctionnement du site ; d&apos;autres nécessitent votre consentement préalable.
          Vous pouvez modifier vos préférences à tout moment.
        </p>

        {/* Tableau */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-white/60 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">Catégorie</th>
                <th className="px-4 py-3 text-left font-semibold">Finalité</th>
                <th className="px-4 py-3 text-left font-semibold">Exemples</th>
                <th className="px-4 py-3 text-left font-semibold">Durée</th>
                <th className="px-4 py-3 text-center font-semibold">Optionnel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {cookieCategories.map((c) => (
                <tr key={c.name} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-4 align-top">
                    <span className="text-white font-medium text-sm">{c.name}</span>
                  </td>
                  <td className="px-4 py-4 text-white/65 text-xs leading-relaxed align-top max-w-xs">
                    {c.purpose}
                  </td>
                  <td className="px-4 py-4 text-white/50 text-xs font-mono align-top whitespace-nowrap">
                    {c.examples}
                  </td>
                  <td className="px-4 py-4 text-white/55 text-xs align-top whitespace-nowrap">
                    {c.duration}
                  </td>
                  <td className="px-4 py-4 text-center align-top">
                    {c.optional ? (
                      <span className="text-tn-blue text-xs font-semibold">Oui</span>
                    ) : (
                      <span className="text-white/30 text-xs">Non</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bouton gérer les préférences */}
        <div className="mt-6">
          <ConsentButton />
        </div>
      </section>

      {/* ── 5. Transferts hors UE ── */}
      <section>
        <h2 className="mb-4">5. Transferts de données hors UE</h2>
        <p className="text-white/75">
          Les données issues des formulaires sont traitées sur des serveurs hébergés au sein de l&apos;Union
          européenne. Si vous acceptez les cookies YouTube (Google LLC), vos données peuvent être transférées
          vers les États-Unis dans le cadre du Data Privacy Framework UE–États-Unis.
        </p>
      </section>

      {/* ── 6. Sécurité ── */}
      <section>
        <h2 className="mb-4">6. Sécurité</h2>
        <p className="text-white/75">
          Terra Numerica met en œuvre des mesures techniques et organisationnelles appropriées pour protéger
          vos données contre tout accès non autorisé, perte ou destruction : chiffrement HTTPS, accès restreint
          aux données, habilitations nominatives.
        </p>
      </section>

      {/* ── 7. Modifications ── */}
      <section>
        <h2 className="mb-4">7. Modifications de la présente politique</h2>
        <p className="text-white/75">
          Cette politique peut être mise à jour pour tenir compte de l&apos;évolution du site ou de la
          réglementation. La date de mise à jour en haut de page reflète la version en vigueur. En cas de
          modification substantielle affectant les cookies, votre consentement sera de nouveau sollicité.
        </p>
      </section>
    </main>
  );
}
