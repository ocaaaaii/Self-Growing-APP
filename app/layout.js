import "./globals.css";

export const metadata = {
  title: "慢慢變好 · Self Growing",
  description: "用溫柔的獎勵機制，慢慢把自己養成喜歡的樣子 🌱",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E8DCC8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
