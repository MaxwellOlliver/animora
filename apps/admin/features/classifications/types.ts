export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export interface ContentClassification {
  id: string;
  name: string;
  description: string | null;
  iconId: string | null;
  icon: Media | null;
  active: boolean;
  createdAt: string;
}
