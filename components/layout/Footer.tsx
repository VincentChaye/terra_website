import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/asset";

const sections = [
  {
    title: "Terra Numerica",
    links: [
      { label: "Le projet", href: "/decouvrir/projet" },
      { label: "Chiffres et carte", href: "/decouvrir/chiffres-et-carte" },
      { label: "Le collectif", href: "/decouvrir/collectif" },
      { label: "Territoires", href: "/decouvrir/territoires" },
      { label: "Partenaires & financeurs", href: "/decouvrir/partenaires-financeurs" },
      { label: "Nous rejoindre", href: "/decouvrir/nous-rejoindre" },
    ],
  },
  {
    title: "Visiter",
    links: [
      { label: "Espace Sophia", href: "/visiter/sophia" },
      { label: "Agenda", href: "/visiter/agenda" },
      { label: "Espaces partenaires", href: "/visiter/espaces-partenaires" },
    ],
  },
  {
    title: "Scolaires & Entreprises",
    links: [
      { label: "Offre scolaires", href: "/scolaires/offre" },
      { label: "Réserver une visite", href: "/scolaires/reserver" },
      { label: "Team building", href: "/entreprises/team-building" },
      { label: "Formations", href: "/entreprises/formations" },
      { label: "Contact entreprises", href: "/entreprises/contact" },
    ],
  },
  {
    title: "Ressources & Actualités",
    links: [
      { label: "Ateliers", href: "/ressources/ateliers" },
      { label: "Conférences", href: "/ressources/conferences" },
      { label: "Actualités", href: "/actualites" },
      { label: "Newsletter", href: "/actualites/newsletter" },
      { label: "Vidéothèque", href: "/actualites/videos" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/terraNumerica",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/terra-numerica",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@terraNumerica",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-tn-dark text-tn-white mt-auto border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        {/* Main grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 mb-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-tn-blue uppercase tracking-wide mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/60 hover:text-tn-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Logos institutionnels */}
        <div className="flex justify-center mb-4">
          <Image
            src={asset("/logos-institutions.jpg")}
            alt="CNRS · Inria · Université Côte d'Azur"
            width={1500}
            height={600}
            className="h-9 w-auto opacity-70"
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
            <Link href="/mentions-legales" className="hover:text-tn-white transition-colors">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:text-tn-white transition-colors">Confidentialité</Link>
            <Link href="/politique-confidentialite#cookies" className="hover:text-tn-white transition-colors">Cookies</Link>
            <Link href="/accessibilite" className="hover:text-tn-white transition-colors">Accessibilité</Link>
            <Link href="/contact" className="hover:text-tn-white transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">© {new Date().getFullYear()} Terra Numerica</span>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-white/40 hover:text-tn-blue transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
