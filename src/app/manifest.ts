import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ObraFácil",
    short_name: "ObraFácil",
    description:
      "Pedidos, orçamentos e clientes — tudo no telemóvel, sem complicações.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#1d4ed8",
    lang: "pt-PT",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
