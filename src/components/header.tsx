import Image from "next/image";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Kiri */}
          <div className="flex-shrink-0">
            <Image
              src="/logopal.png"
              alt="Logo PAL"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Judul Tengah (Optional) */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-blue-900">{title}</h1>
            </div>
          )}

          {/* Logo Kanan */}
          <div className="flex-shrink-0">
            <Image
              src="/logorekum.png"
              alt="Logo Rekum"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
