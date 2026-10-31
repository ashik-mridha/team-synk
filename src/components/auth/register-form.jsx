'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { EmailSuggestion } from '@/components/auth/email-suggestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { authClient, getAuthErrorMessage } from '@/lib/auth-client';
import { registerSchema } from '@/lib/validators/auth';

export function RegisterForm() {
  const next = useSearchParams().get('next');
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });
  const email = useWatch({ control, name: 'email' }) ?? '';
  const password = useWatch({ control, name: 'password' }) ?? '';

  // On success useSession() updates and GuestGuard performs the redirect.
  async function onSubmit(values) {
    try {
      const { error } = await authClient.signUp.email(values);
      if (!error) return;
      if (error.code?.startsWith('USER_ALREADY_EXISTS')) {
        setError('email', { message: 'An account with this email already exists' });
      }
      toast.error(getAuthErrorMessage(error));
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  }

  return (
    <Card className="border-transparent bg-transparent shadow-none sm:border-border sm:bg-surface sm:shadow-raised">
      <CardHeader className="gap-2 px-0 sm:px-8 sm:pt-8">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start organising work with your team in minutes.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-8 sm:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField label="Full name" error={errors.name?.message}>
            <Input autoComplete="name" autoFocus placeholder="Rahim Uddin" {...register('name')} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register('email')}
            />
          </FormField>
          <EmailSuggestion
            value={email}
            onAccept={(next) => setValue('email', next, { shouldValidate: true })}
          />
          <div className="flex flex-col gap-2.5">
            <FormField
              label="Password"
              error={errors.password?.message}
              hint="At least 8 characters with a letter and a number."
            >
              <PasswordInput
                autoComplete="new-password"
                placeholder="Create a password"
                {...register('password')}
              />
            </FormField>
            <PasswordStrengthMeter password={password} />
          </div>
          <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
            className="rounded-sm font-medium text-primary-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
