import type { Metadata } from "next";
import { Inter, Pacifico } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NotificationSystem from "@/components/notifications/NotificationSystem";
import ChatSystem from "@/components/chat/ChatSystem";
// Temporarily disable realtime notifications to stop backend errors
// import RealTimeNotifications from "@/components/notifications/RealTimeNotifications";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediLink+ - Medical Tourism App",
  description: "Connect with medical interpreters and hospitals in Seoul",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${inter.variable} ${pacifico.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <NotificationSystem />
          <ChatSystem />
          {/* <RealTimeNotifications /> */}
        </AuthProvider>
      </body>
    </html>
  );
}