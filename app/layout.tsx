import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "Flash Delivery",
  description: "ระบบบันทึกยอดจัดส่งพัสดุ",
};

import Providers from "@/components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ef4444" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
