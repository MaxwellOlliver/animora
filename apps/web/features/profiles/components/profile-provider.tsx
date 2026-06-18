"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Profile } from "@/features/profiles/queries/fetch-profiles";

interface ProfileContextValue {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useCurrentProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useCurrentProfile must be used within a ProfileProvider");
  }
  return ctx;
}

export function ProfileProvider({
  initialProfile,
  children,
}: {
  initialProfile: Profile | null;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);

  // Re-sync when the server passes a fresh profile (e.g. after switching
  // profiles or a router.refresh() following an avatar/profile update).
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
