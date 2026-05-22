import "./globals.css";

export const metadata = {
  title: "慢慢變好 · Self Growing",
  description: "用溫柔的獎勵機制，慢慢把自己養成喜歡的樣子 🌱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "慢慢變好",
  },
  icons: {
    apple: "/icon.png",
    icon: "/icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E8DCC8",
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
