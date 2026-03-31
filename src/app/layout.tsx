import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDwN1tDqbLqpSOndAcgj4yzMPHTakwoRBos75lwXo5xMvrHoA-KaPblRmkoh74V2QXZQOGS7ZjEU_n5obsX3DKngBeIss0rIKViGVJ-stt-iiIn4G44rozcEkFfFHcNt4sUeIlBMwTXsLXDXqfAmJPfO2X1rzpPYup0vcyuKZm_kX6J4sVf9oD8yhcnEHTsBdz5quBO2OMS99VQGHJit6C0F9ONSEdswjspDtOlXbcu9H1_rSw0MN4CzYALl9ahSfIPPWJwg41wiV_M";

export const viewport: Viewport = {
  themeColor: "#11131c",
};

export const metadata: Metadata = {
  title: "BSD TYPING - 검은 성소의 부름",
  description: "타자로 마법을 영창하여 어둠의 군단에 맞서십시오. RPG 스타일 한영 타자 연습기",
  openGraph: {
    title: "BSD TYPING - 검은 성소의 부름",
    description: "타자로 마법을 영창하여 어둠의 군단에 맞서십시오. RPG 스타일 한영 타자 연습기",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "검은 성소의 부름 - BSD TYPING",
      },
    ],
    type: "website",
    siteName: "BSD TYPING",
  },
  twitter: {
    card: "summary_large_image",
    title: "BSD TYPING - 검은 성소의 부름",
    description: "타자로 마법을 영창하여 어둠의 군단에 맞서십시오.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface text-on-surface`}
      >
        {children}
      </body>
    </html>
  );
}
