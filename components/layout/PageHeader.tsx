import Link from "next/link";

interface Crumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  breadcrumb?: Crumb[];
}

export default function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <div className="py-10 px-4 border-b border-white/15 text-center">
      <div className="max-w-4xl mx-auto">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Fil d'ariane" className="text-sm text-white/40 mb-3 flex justify-center gap-1 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            {breadcrumb.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1">
                <span>/</span>
                <Link href={crumb.href} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[36px] font-light text-white leading-tight">{title}</h1>
        {description && (
          <p className="text-white/75 mt-3 max-w-2xl mx-auto text-[18px] leading-relaxed mb-0">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
