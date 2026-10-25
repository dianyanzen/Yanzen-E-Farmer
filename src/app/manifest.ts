import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Yanzen E-Farmer",
    short_name: "YZ E-Farmer",
    description: "Manajemen usaha pertanian dan perkebunan Putra Mandiri",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#f7f8f1",
    theme_color: "#103e32",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
