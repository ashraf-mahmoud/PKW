import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/announcement-bar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { auth } from "@/auth";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { getCurrency } from "@/actions/settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parkour Warriors Academy",
  description: "Malaysia's premier Parkour & Tricking academy.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const currency = await getCurrency();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen flex flex-col`}>
        <CurrencyProvider initialCurrency={currency}>
          <ToastProvider>
            <AnnouncementBar />
            <Header session={session} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ToastViewport />
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
