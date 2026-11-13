import { Pirata_One, IM_Fell_English, IM_Fell_English_SC, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Pirata_One({ weight: "400", subsets: ["latin"], variable: "--f-display" });
const body = IM_Fell_English({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--f-body" });
const caps = IM_Fell_English_SC({ weight: "400", subsets: ["latin"], variable: "--f-caps" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--f-mono" });

export const metadata = {
  title: "Maré Negra",
  description: "Carta náutica 3D de um capitão aprendendo Java, ilha por ilha.",
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#05080d" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${caps.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
