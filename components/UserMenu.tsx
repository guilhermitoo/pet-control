"use client";

import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

interface UserMenuProps {
  user: User;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useOnClickOutside(ref, () => setIsOpen(false));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleProfile = () => {
    router.push("/profile");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-100 focus:outline-none"
      >
        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-medium text-white">
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {user.name || user.email || "Usuário"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleProfile}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Meu Perfil
          </button>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
};