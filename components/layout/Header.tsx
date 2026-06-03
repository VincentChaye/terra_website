"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const navItems = [
  { label: "Découvrir", href: "/decouvrir" },
  { label: "Visiter", href: "/visiter" },
  { label: "Scolaires", href: "/scolaires" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Ressources", href: "/ressources" },
  { label: "Actualités", href: "/actualites" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-tn-dark text-white sticky top-0 z-50 border-b-2 border-tn-blue">
      {/* Row 1 — Logo */}
      <div className="relative flex items-center justify-center py-5 px-4">
        <Link
          href="/"
          className="flex items-center gap-5"
          aria-label="Terra Numerica — accueil"
        >
          <Image
            src="/globe-tn.png"
            alt=""
            width={270}
            height={270}
            className="w-[72px] h-[72px] shrink-0"
            priority
          />
          <div className="leading-[1.05] select-none">
            <span className="block font-bold tracking-[0.18em] text-white"
              style={{ fontSize: "2.1rem" }}>
              TERRA
            </span>
            <span className="block font-bold tracking-[0.18em] text-tn-blue"
              style={{ fontSize: "2.1rem" }}>
              NUMERICA
            </span>
          </div>
        </Link>

        {/* Mobile toggle — positionné en absolu pour ne pas décaler le logo */}
        <button
          className="lg:hidden absolute right-4 p-2 text-white hover:text-tn-blue transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Row 2 — Navigation desktop */}
      <nav className="hidden lg:block border-t border-white/15" aria-label="Navigation principale">
        <ul className="flex justify-center items-stretch">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-1.5 px-6 py-3.5 text-[0.875rem] tracking-wide font-medium text-white/90 hover:text-tn-blue transition-colors"
              >
                {item.label}
                <ChevronDown size={12} className="opacity-40 mt-px" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu */}
      {open && (
        <nav
          id="mobile-menu"
          className="lg:hidden border-t border-white/15"
          aria-label="Navigation mobile"
        >
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-6 py-4 text-sm text-white hover:text-tn-blue border-b border-white/10 transition-colors"
                >
                  {item.label}
                  <ChevronDown size={14} className="opacity-40" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
