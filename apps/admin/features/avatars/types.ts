export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export interface Avatar {
  id: string;
  name: string;
  pictureId: string | null;
  picture: Media | null;
  active: boolean;
  default: boolean;
  createdAt: string;
}
