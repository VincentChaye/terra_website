import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terra Numerica — Les sciences du numérique à portée de main",
  description:
    "Innover et agir pour la culture scientifique et l'éducation au numérique de manière ludique et participative. Ateliers, conférences, espaces partenaires — CNRS · Inria · Université Côte d'Azur.",
  alternates: { canonical: "/" },
};

/* ─── Données ─────────────────────────────────────────────── */

const stats = [
  { value: "97 437", label: "Citoyens touchés", sub: "depuis 2022" },
  { value: "6 857",  label: "Enseignants formés", sub: "toutes académies" },
  { value: "300+",   label: "Événements / an", sub: "Région Sud & au-delà" },
  { value: "26",     label: "Espaces partenaires", sub: "4 départements" },
  { value: "150+",   label: "Ateliers en ligne", sub: "portail.terra-numerica.org" },
];

const growthData = [
  { year: "2022", visitors: 8000 },
  { year: "2023", visitors: 18000 },
  { year: "2024", visitors: 30000 },
  { year: "2025", visitors: 36000 },
];
const growthMax = 40000;

const photos = [
  {
    src: "/thumb_c2kGOPqLhPM.jpg",
    alt: "Atelier robotique avec des élèves à Terra Numerica Sophia",
    caption: "Ateliers pour les scolaires",
  },
  {
    src: "/thumb_4zo9_7Gm8v4.jpg",
    alt: "Conférence géométrie interactive avec des enfants",
    caption: "Conférences interactives",
  },
  {
    src: "/thumb_036we6iat08.jpg",
    alt: "Village des sciences Terra Numerica",
    caption: "Village des sciences",
  },
];

const audiences = [
  {
    title: "Scolaires & Enseignants",
    desc: "Ateliers de la maternelle au lycée, gratuits pour les établissements publics.",
    href: "/scolaires/offre",
    cta: "Réserver une visite",
    accent: true,
  },
  {
    title: "Grand Public",
    desc: "Chaque 1er samedi du mois (14h–18h) à Terra Numerica Sophia. Gratuit.",
    href: "/visiter/agenda",
    cta: "Voir l'agenda",
  },
  {
    title: "Entreprises",
    desc: "Team building, formations sur mesure et mécénat scientifique.",
    href: "/entreprises",
    cta: "Nos offres",
  },
];

/* ─── Composant réseau SVG (décoratif) ───────────────────── */
function NetworkBg() {
  const nodes = [
    [15, 20], [35, 8], [55, 18], [75, 12], [90, 25],
    [8, 45],  [28, 38], [48, 50], [68, 42], [85, 55],
    [18, 68], [40, 72], [62, 65], [80, 78], [95, 60],
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,7],[3,8],[4,9],
    [5,6],[6,7],[7,8],[8,9],[5,10],[6,11],[7,12],[8,13],[9,14],
    [10,11],[11,12],[12,13],[13,14],[2,6],[6,11],
  ];
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#24A1EB"
          strokeWidth="0.15"
          strokeOpacity="0.25"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y} r="0.6"
          fill="#24A1EB"
          fillOpacity="0.5"
          className="pulse-dot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </svg>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden min-h-[480px] flex items-center py-20 px-4">
        <NetworkBg />
        {/* gradient overlay pour lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(26,24,45,0.3) 0%, rgba(26,24,45,0.85) 100%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <p className="text-tn-blue tracking-[0.2em] text-sm font-semibold uppercase mb-4">
            CNRS · Inria · Université Côte d&apos;Azur
          </p>
          <h1
            className="font-light text-white leading-tight mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
          >
            Les sciences du numérique<br />
            <em className="not-italic text-tn-blue">à portée de tous</em>
          </h1>
          <p className="text-white/75 max-w-2xl mx-auto mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.7" }}>
            L&apos;IA, la cryptographie, les algorithmes et les réseaux façonnent notre quotidien —
            pourtant ils restent opaques pour la plupart des citoyens.
            Terra Numerica rend ces sciences <strong className="text-white font-semibold">accessibles, ludiques et gratuites</strong> pour tous.
          </p>
          <p className="text-white/60 mb-8 text-base">
            Retrouvez-nous à{" "}
            <Link href="/visiter/sophia" className="text-tn-blue hover:underline">
              Terra Numerica Sophia
            </Link>
            , 18 rue Frédéric Mistral, 06560 Valbonne.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/scolaires/reserver"
              className="px-7 py-3 rounded font-semibold bg-tn-blue text-white hover:bg-[#1a8fd1] transition-colors"
            >
              Réserver une visite
            </Link>
            <Link
              href="/decouvrir/projet"
              className="px-7 py-3 rounded font-semibold border border-white/30 text-white hover:border-tn-blue hover:text-tn-blue transition-colors"
            >
              Découvrir le projet
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="border-y border-white/10 py-10 px-4 bg-white/3">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span
                  className="font-bold text-tn-blue tabular-nums"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1 }}
                >
                  {s.value}
                </span>
                <span className="text-white font-medium text-sm">{s.label}</span>
                <span className="text-white/45 text-xs">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PROBLÈME / SOLUTION ══════════ */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-3">Notre mission</p>
          <h2 className="font-light text-white mb-5" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", lineHeight: 1.25 }}>
            Pourquoi Terra Numerica&nbsp;?
          </h2>
          <p className="text-white/80 mb-4 leading-relaxed" style={{ fontSize: "1rem" }}>
            Le numérique est partout mais compris par trop peu. Les sciences qui le sous-tendent —
            algorithmes, intelligence artificielle, cryptographie, réseaux — sont enseignées
            de façon insuffisante et restent inaccessibles au grand public.
          </p>
          <p className="text-white/80 mb-4 leading-relaxed" style={{ fontSize: "1rem" }}>
            Terra Numerica est un consortium fondé par le CNRS, Inria et l&apos;Université
            Côte d&apos;Azur pour changer cela. Ses chercheurs conçoivent des ateliers
            rigoureusement validés, ludiques et participatifs, adaptés à tous les publics
            — de la maternelle au grand public adulte.
          </p>
          <p className="text-white/80 leading-relaxed" style={{ fontSize: "1rem" }}>
            Résultat : <strong className="text-white">plus de 150 000 personnes</strong> sensibilisées
            ou formées depuis le lancement, dans 250 lieux d&apos;actions en Région Sud et au-delà.
          </p>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-video">
          <Image
            src="/thumb_evb13BXG-G0.jpg"
            alt="97 437 citoyens et 6 857 enseignants touchés par Terra Numerica"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tn-dark/60 to-transparent" />
        </div>
      </section>

      {/* ══════════ CROISSANCE — bar chart SVG ══════════ */}
      <section className="border-y border-white/10 py-14 px-4 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <p className="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-2 text-center">Impact</p>
          <h2 className="font-light text-white text-center mb-10" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
            Une croissance continue depuis l&apos;inauguration
          </h2>
          <div className="flex items-end justify-center gap-6 h-48">
            {growthData.map((d, i) => {
              const pct = (d.visitors / growthMax) * 100;
              return (
                <div key={d.year} className="flex flex-col items-center gap-2" style={{ width: "80px" }}>
                  <span className="text-tn-blue text-sm font-semibold">
                    {d.visitors >= 1000 ? `${(d.visitors / 1000).toFixed(0)} k` : d.visitors}
                  </span>
                  <div
                    className="w-full rounded-t bg-tn-blue animate-grow-bar"
                    style={{
                      height: `${(pct / 100) * 148}px`,
                      opacity: 0.5 + i * 0.15,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                  <span className="text-white/60 text-xs">{d.year}</span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-white/40 text-xs mt-4">Visiteurs annuels (estimation)</p>
        </div>
      </section>

      {/* ══════════ PHOTOS ══════════ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-2">Sur le terrain</p>
        <h2 className="font-light text-white mb-8" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
          Des expériences pour tous les publics
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div key={p.src} className="group relative overflow-hidden rounded-xl aspect-video">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tn-dark/80 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 text-white text-sm font-medium">{p.caption}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div className="group relative overflow-hidden rounded-xl" style={{ aspectRatio: "16/7" }}>
            <Image
              src="/thumb_eu8G7O6SGJA.jpg"
              alt="Présentation Terra Numerica avec partenaires CNRS Inria UCA"
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tn-dark/70 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Réseau de partenaires</p>
          </div>
          <div className="group relative overflow-hidden rounded-xl" style={{ aspectRatio: "16/7" }}>
            <Image
              src="/thumb_c2kGOPqLhPM.jpg"
              alt="Atelier pratique avec des enfants et des chercheurs"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tn-dark/70 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-3 text-white text-sm font-medium">Ateliers pratiques</p>
          </div>
        </div>
      </section>

      {/* ══════════ AUDIENCES ══════════ */}
      <section className="border-t border-white/10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-2 text-center">Accès rapide</p>
          <h2 className="font-light text-white text-center mb-10" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>
            Une offre pour chaque public
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {audiences.map((a) => (
              <div
                key={a.href}
                className={`rounded-xl p-7 flex flex-col gap-4 border transition-colors ${
                  a.accent
                    ? "border-tn-blue bg-tn-blue/8"
                    : "border-white/15 hover:border-tn-blue"
                }`}
              >
                <h3 className="font-semibold text-white text-lg leading-tight">{a.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed flex-1">{a.desc}</p>
                <Link
                  href={a.href}
                  className={`inline-block text-sm font-semibold text-center py-2.5 px-5 rounded transition-colors ${
                    a.accent
                      ? "bg-tn-blue text-white hover:bg-[#1a8fd1]"
                      : "text-tn-blue hover:text-white hover:bg-tn-blue"
                  }`}
                >
                  {a.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ADRESSE / CONTACT ══════════ */}
      <section className="border-t border-white/10 py-10 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-white/50 text-sm mb-1">
            <Link href="/visiter/sophia" className="text-tn-blue hover:underline">
              Terra Numerica Sophia
            </Link>
            {" "}— 18 rue Frédéric Mistral, 06560 Valbonne
          </p>
          <p className="text-white/50 text-sm">
            <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
              contact@terra-numerica.org
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
