"use client";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { House, Database, ClipboardList } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
    <Sidebar className="border-neutral-200">
      <SidebarHeader className="h-14 justify-center border-b border-neutral-200 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
            <Image
              src="/logo-gpib.png"
              alt="Logo GPIB Ebenhaezer"
              width={32}
              height={32}
              className="size-8 object-contain"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-neutral-900">
              GPIB Ebenhaezer
            </p>
            <p className="truncate text-xs text-neutral-500">Palangka Raya</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {MENU.map(({ u, n, i: Icon }) => (
                <SidebarMenuItem key={u}>
                  <SidebarMenuButton
                    isActive={path === u}
                    onClick={() => router.push(u)}
                    className="h-9 rounded-md text-neutral-500 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-900 data-[active=true]:bg-neutral-100 data-[active=true]:font-medium data-[active=true]:text-neutral-900"
                  >
                    <Icon className="size-4" />
                    <span>{n}</span>
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
