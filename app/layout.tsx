import "./globals.css";
import { JetBrains_Mono, Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "ChatGPT Toolbox",
  description: "The ChatGPT that can store your prompts.",
  appleWebApp: {
    title: "ChatGPT Toolbox",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@400;500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
