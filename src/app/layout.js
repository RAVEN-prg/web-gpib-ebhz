import "./globals.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "@/components/app-sidebar";

export const metadata = { title: "Database Gereja GPIB Ebenhaezer Palangka Raya" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 items-center border-b px-3"><SidebarTrigger /></header>
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
