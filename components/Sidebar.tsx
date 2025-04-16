"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  PawPrint, 
  Users, 
  Calendar, 
  Package, 
  ShoppingCart,
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, title, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <div className="text-gray-500">{icon}</div>
      <span>{title}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      icon: <Home size={20} />,
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Calendar size={20} />,
      title: "Agendamentos",
      href: "/dashboard/agendamentos",
    },
    {
      icon: <PawPrint size={20} />,
      title: "Pets",
      href: "/dashboard/pets",
    },
    {
      icon: <Users size={20} />,
      title: "Tutores",
      href: "/dashboard/tutores",
    },
    {
      icon: <Package size={20} />,
      title: "Produtos",
      href: "/dashboard/produtos",
    },
    {
      icon: <Settings size={20} />,
      title: "Configurações",
      href: "/dashboard/configuracoes",
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed left-4 top-4 z-30 block rounded-md bg-white p-2 text-gray-600 shadow-md md:hidden"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-20 transform bg-white p-6 transition-transform duration-200 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mt-10 flex flex-col space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              title={item.title}
              href={item.href}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden h-full w-64 flex-shrink-0 border-r border-gray-200 bg-white md:block">
        <div className="flex h-full flex-col py-6">
          <div className="flex flex-col space-y-1 px-4">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                title={item.title}
                href={item.href}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};