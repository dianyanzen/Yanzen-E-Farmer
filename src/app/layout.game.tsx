import type { Metadata } from "next";
import "./globals.css";
import "./tokens.css";

export const metadata: Metadata = {
  title: "YZ Farm Life",
  description: "Bertani, berteman, dan jelajahi dunia YZ Farm Life.",
  applicationName: "YZ Farm Life",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
