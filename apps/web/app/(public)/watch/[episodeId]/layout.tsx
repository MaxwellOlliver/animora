import { Navbar } from "@/features/catalog/components/navbar";

const NAVBAR_HEIGHT = 80;

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full w-full flex-col"
      style={
        {
          "--navbar-height": `${NAVBAR_HEIGHT}px`,
        } as React.CSSProperties
      }
    >
      <Navbar />
      {children}
    </div>
  );
}
