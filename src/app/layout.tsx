import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from "@/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onchain Rock Paper Scissors",
  description: "Verifiably Random Onchain Rock Paper Scissors",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const headersList = await headers()
  const cookies = headersList.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>


      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProvider cookies={cookies}>

            {children}

          </ContextProvider>
        </ThemeProvider>

      </body>


    </html >
  );
}