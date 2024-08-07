import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";

import { cookieToInitialState } from 'wagmi'
import { config } from "@/utils/config";
import Web3ModalProvider from "@/utils/context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "REAP MiniTap",
  description: "Tap to earn crypto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get('cookie'))
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-black`}>
        <Web3ModalProvider initialState={initialState}>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  );
}
