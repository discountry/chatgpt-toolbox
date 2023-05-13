import "./globals.css";

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
      <body className="bg-gradient-to-b from-zinc-800 to-zinc-900">
        {children}
      </body>
    </html>
  );
}
