interface CatalogSectionProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function CatalogSection({
  children,
  title,
  subtitle,
}: CatalogSectionProps) {
  return (
    <div className="catalog-section relative z-10 flex flex-col gap-4 px-12 py-12">
      <h3 className="font-heading text-2xl leading-8 font-semibold">{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}
