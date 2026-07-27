import { PlayerHost } from "@/features/watch/components/player/player-host";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PlayerHost />
    </>
  );
}
