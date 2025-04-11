// components/Logo.tsx
import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center justify-center">
      <div className="relative h-16 w-48">
        <Image
          src="/logo.png" // Certifique-se de adicionar o logo ao diretório public
          alt="PetShop Control Logo"
          fill
          className="object-contain"
        />
      </div>
    </Link>
  );
};