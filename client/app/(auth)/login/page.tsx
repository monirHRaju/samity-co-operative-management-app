import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Samity App</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cooperative Society Management
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}