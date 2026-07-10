import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://compamisson.netlify.app"),
  title: {
    default: "Compamisson — Art commissions, organized",
    template: "%s · Compamisson",
  },
  description:
    "Discover artists, chat directly, manage commissions, and pay creators through PromptPay, PayPal, or bank transfer.",
  applicationName: "Compamisson",
  keywords: ["art commissions", "artists", "PromptPay", "commission marketplace"],
  openGraph: {
    type: "website",
    title: "Compamisson — Art commissions, organized",
    description:
      "A social platform where artists and customers meet, chat, and commission art.",
    siteName: "Compamisson",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
