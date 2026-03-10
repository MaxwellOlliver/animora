import { Navbar } from "@/features/catalog/components/navbar";

const NAVBAR_HEIGHT = 80;

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full w-full flex-col gap-4 @container/catalog relative"
      style={
        {
          "--navbar-height": `${NAVBAR_HEIGHT}px`,
        } as React.CSSProperties
      }
    >
      <Navbar />
      <div className="flex h-full w-full flex-col gap-4">{children}</div>
    </div>
  );
}
