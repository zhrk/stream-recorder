export type KickApiVods = {
  session_title: string;
  start_time: string;
  id: number;
  source: string;
}[];

export type StoredVods = {
  title: string;
  start_time: string;
  id: string | number;
  url: string;
}[];
