import type { Metadata } from "next";
import Link from "next/link";
import ReservationScolairesForm from "@/components/forms/ReservationScolairesForm";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Réserver une visite scolaire",
  description:
    "Demandez un créneau pour amener votre classe à Terra Numerica. Réponse sous 48 h ouvrées.",
  alternates: { canonical: "/scolaires/reserver" },
};

export default function ReserverPage() {
  return (
    <div>
      <PageHeader
        title="Réserver une visite scolaire"
        description="Remplissez ce formulaire et nous vous confirmons votre créneau sous 48 h ouvrées. Les visites sont gratuites pour les établissements publics."
        breadcrumb={[{ label: "Scolaires", href: "/scolaires/offre" }]}
      />

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ReservationScolairesForm />
          </div>
          {/* Sidebar */}
          <aside className="space-y-6 text-sm">
            <div className="rounded-lg bg-white/5 border border-white/20 p-5">
              <h2 className="font-semibold text-white mb-3">Informations pratiques</h2>
              <ul className="space-y-2 text-white/70">
                <li>📍 Sophia Antipolis (06) + espaces partenaires</li>
                <li>🕘 Demi-journée ou journée complète</li>
                <li>👥 Groupes de 15 à 35 élèves</li>
                <li>🆓 Gratuit — établissements publics</li>
              </ul>
            </div>
            <div className="rounded-lg bg-tn-dark text-tn-white p-5">
              <h2 className="font-semibold mb-2">Voir l&apos;offre complète</h2>
              <p className="text-white/70 text-xs mb-3">
                Consultez nos modules par niveau avant de réserver.
              </p>
              <Link
                href="/scolaires/offre"
                className="text-tn-blue text-sm font-medium hover:underline"
              >
                Offre pédagogique →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
