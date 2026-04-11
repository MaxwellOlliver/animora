"use client";

import { Bookmark, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect,useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navbarLinks = [
  { name: "home", href: "/home" },
  { name: "categories", href: "/categories" },
  { name: "season", href: "/season" },
  { name: "calendar", href: "/season" },
];

export function Navbar({ hideOnTop = false }: { hideOnTop?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "navbar fixed top-0 z-20 w-full h-(--navbar-height) flex items-center justify-between px-12 transition-all duration-300",
        hideOnTop && !scrolled
          ? "-translate-y-full opacity-0"
          : scrolled
            ? "bg-background/95"
            : "bg-linear-to-b from-background via-background/85 via-55% to-transparent",
      )}
    >
      <div className="flex items-center gap-8">
        <Image
          src="/images/logo-no-slogan.svg"
          alt="Animora"
          width={132}
          height={37}
          priority
        />
        <ul className="flex items-center gap-4">
          {navbarLinks.map((link) => (
            <li key={link.name} className="text-foreground-muted text-sm">
              <Link
                href={link.href}
                className={cn(
                  "hover:text-foreground transition-colors duration-300 font-heading",
                  pathname === link.href && "text-foreground font-semibold",
                )}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-4">
        {/*<button className="text-foreground-muted hover:text-foreground transition-colors duration-300">
          Sign In
        </button>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300">
          Sign Up
        </button>*/}
        <Button variant="ghost" size="icon-sm">
          <Search />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Bookmark />
        </Button>
        <Avatar
          className="size-8 rounded-lg"
          src="/images/avatar-placeholder.svg"
          alt="Profile"
        />
      </div>
    </nav>
  );
}
