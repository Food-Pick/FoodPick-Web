import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LocationProvider } from './contexts/LocationContext';
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FoodPick - 내 주변 맛집 추천",
  description: "내 주변 맛집, 음식점, 메뉴 추천 서비스",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  const session = await getServerSession(authOptions);
  console.log('session', session);
  
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>
        <Providers session={session}>
          <LocationProvider>
            {children}
          </LocationProvider>
        </Providers>
      </body>
    </html>
  );
}
