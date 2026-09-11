import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Máy 24/7 + học Ethereum",
  description: "Hướng dẫn từ số 0, radar meme, airdrop/game, paper trading."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
