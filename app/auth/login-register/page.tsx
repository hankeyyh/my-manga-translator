import { LoginRegisterForm } from "@/components/login-register-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gray-50 p-6 md:p-10">
      <div className="w-full max-w-[448px]">
        <LoginRegisterForm />
      </div>
    </div>
  );
}
