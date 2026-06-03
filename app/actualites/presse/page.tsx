import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { getPresse } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles sur Terra Numerica",
  description:
    "Publications consacrées à Terra Numerica dans les médias depuis 2022.",
  alternates: { canonical: "/actualites/presse" },
};

export default function PressePage() {
  const items = getPresse(); // tri par date desc, synchrone → page statique

  // Regrouper par année (la date est "YYYY-MM")
  const byYear = new Map<string, typeof items>();
  for (const item of items) {
    const year = item.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(item);
  }
  // Les années sont déjà en ordre décroissant car items trié par date desc
  const years = Array.from(byYear.keys());

  return (
    <div>
      <PageHeader
        title="Articles sur Terra Numerica"
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Découvrez les publications consacrées à Terra Numerica.
        </p>

        {years.map((year) => (
          <section key={year}>
            <h2 className="text-xl font-bold text-white mt-8 mb-3">{year}</h2>
            <ul className="space-y-1 text-white/85">
              {byYear.get(year)!.map((item) =>
                item.url ? (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-tn-blue transition-colors"
                    >
                      {item.title} ({item.source}).
                    </a>
                  </li>
                ) : (
                  <li key={item.id}>
                    {item.title} ({item.source}).
                  </li>
                )
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
