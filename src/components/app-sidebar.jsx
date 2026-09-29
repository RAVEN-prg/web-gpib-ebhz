"use client";
import { usePathname, useRouter } from "next/navigation";
import { House, Database, ClipboardList } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
} from "@/components/ui/sidebar";

const MENU = [
  { u: "/", n: "Home", i: House },
  { u: "/database", n: "Database jemaat", i: Database },
  { u: "/isi-data", n: "Isi data jemaat", i: ClipboardList },
];

export default function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <p className="font-semibold leading-tight">GPIB Ebenhaezer<br />Palangka Raya</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU.map(({ u, n, i: Icon }) => (
                <SidebarMenuItem key={u}>
                  <SidebarMenuButton isActive={path === u} onClick={() => router.push(u)}>
                    <Icon /><span>{n}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
