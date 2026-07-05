export type ProfileWithAvatar = {
  id: string;
  name: string;
  avatar: {
    picture: { key: string; purpose: string } | null;
  } | null;
};
