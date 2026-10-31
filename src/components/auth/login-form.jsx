'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { authClient, getAuthErrorMessage } from '@/lib/auth-client';
import { loginSchema } from '@/lib/validators/auth';

export function LoginForm() {
  const next = useSearchParams().get('next');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // On success useSession() updates and GuestGuard performs the redirect.
  async function onSubmit(values) {
    try {
      const { error } = await authClient.signIn.email(values);
      if (error) toast.error(getAuthErrorMessage(error));
    } catch {
      toast.error('Cannot reach the server. Check your connection and try again.');
    }
  }

  return (
    <Card className="border-transparent bg-transparent shadow-none sm:border-border sm:bg-surface sm:shadow-raised">
      <CardHeader className="gap-2 px-0 sm:px-8 sm:pt-8">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-8 sm:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField label="Email" error={errors.email?.message}>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="you@company.com"
              {...register('email')}
            />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <PasswordInput
              autoComplete="current-password"
              placeholder="Your password"
              {...register('password')}
            />
          </FormField>
          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          New to TeamSync?{' '}
          <Link
            href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
            className="rounded-sm font-medium text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
