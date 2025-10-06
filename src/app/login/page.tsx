import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background_login.png"
          alt="Login Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Optional overlay for better readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Login Form Content */}
      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
