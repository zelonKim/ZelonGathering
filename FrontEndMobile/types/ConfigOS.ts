export type OS = "android" | "ios";

export interface ConfigOS {
  label: string;
  qrPath: string;
  qrAlt: string;
  title: string;
  guide: React.ReactNode;
}
