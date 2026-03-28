export interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  subComponent?: React.ReactNode;
}

export function SettingsItem({
  icon,
  label,
  onClick,
  subComponent,
}: SettingsItemProps) {
  return (
    <button
      className="flex items-center justify-between w-full p-2 px-2.5 rounded-md hover:bg-foreground/10 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring outline-none"
      onClick={onClick}
    >
      <div className="flex gap-2 items-center [&_svg]:size-4 [&_svg]:shrink-0">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {subComponent}
    </button>
  );
}
