import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Contact et mentions légales — Terra Numerica",
  description:
    "Contactez l'équipe Terra Numerica. Adresse, email, et informations légales.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="Contact et mentions légales"
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h2 className="text-xl font-bold text-white mt-8 mb-3">Contact</h2>
        <p className="text-white/85 leading-relaxed">
          Une question ? Une demande ?{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Adresse</h2>
        <address className="text-white/85 not-italic leading-relaxed">
          Terra Numerica<br />
          18 rue Frédéric Mistral<br />
          06560 Valbonne — Sophia Antipolis
        </address>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Mentions légales</h2>
        <p className="text-white/85 leading-relaxed">
          Conformité RGPD et Utilisation des cookies.
        </p>
        <ul className="space-y-1 text-white/85">
          <li>
            <Link href="/politique-confidentialite" className="text-tn-blue hover:underline">
              Politique de confidentialité
            </Link>
          </li>
          <li>
            <Link href="/mentions-legales" className="text-tn-blue hover:underline">
              Mentions légales
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
