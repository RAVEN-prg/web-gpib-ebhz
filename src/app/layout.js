import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "@/components/app-sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Database Gereja GPIB Ebenhaezer Palangka Raya",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-neutral-50">
            <header className="sticky top-0 z-10 flex h-14 items-center border-b border-neutral-200 bg-white/80 px-4 backdrop-blur">
              <SidebarTrigger className="text-neutral-500 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900" />
            </header>
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
