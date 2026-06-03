import type { Metadata } from "next";
import Link from "next/link";
import ContactEntreprisesForm from "@/components/forms/ContactEntreprisesForm";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Contact entreprises",
  description:
    "Contactez Terra Numerica pour organiser un team building, une formation ou un partenariat de mécénat.",
  alternates: { canonical: "/entreprises/contact" },
};

export default function EntreprisesContactPage() {
  return (
    <div>
      <PageHeader
        title="Contactez-nous — Entreprises"
        description="Team building, formation, mécénat — décrivez votre projet et nous revenons vers vous sous 2 jours ouvrés."
        breadcrumb={[{ label: "Entreprises", href: "/entreprises" }]}
      />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ContactEntreprisesForm />
          </div>
          <aside className="space-y-6 text-sm">
            <div className="rounded-lg bg-white/5 border border-white/20 p-5">
              <h2 className="font-semibold text-white mb-3">Nos offres entreprises</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/entreprises/team-building" className="text-tn-blue hover:underline">
                    Team building →
                  </Link>
                </li>
                <li>
                  <Link href="/entreprises/formations" className="text-tn-blue hover:underline">
                    Formations →
                  </Link>
                </li>
                <li>
                  <Link href="/entreprises/mecenat" className="text-tn-blue hover:underline">
                    Mécénat →
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
