export const getObjectUrl = (key: string) =>
  new URL(`${process.env.NEXT_PUBLIC_URL}/api/image/animora/${key}`).toString();

export const getImageUrl = (key: string) => `/api/image/animora/${key}`;
