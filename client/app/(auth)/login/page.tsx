'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeOff, Eye } from 'lucide-react';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: "",
  });
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setStatusMessage({ type: null, text: "" });
    try {
      const response = await api.post('/auth/login', data);
      const authData = response.data?.data;

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Login failed');
      }

      if (!authData?.accessToken || !authData?.user) {
        throw new Error('Invalid authentication response');
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', authData.accessToken);
      }

      dispatch(setCredentials({
        user: authData.user,
        accessToken: authData.accessToken,
      }));

      setStatusMessage({ type: "success", text: "Signed in successfully. Redirecting..." });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Sign in failed. Please try again.";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Access your dashboard and manage your cooperative society
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {statusMessage.text ? (
              <div
                role="alert"
                className={`rounded-md border px-3 py-2 text-sm ${statusMessage.type === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"}`}
              >
                {statusMessage.text}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
