'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { authClient, getAuthErrorMessage } from '@/lib/auth-client';
import { changePasswordSchema } from '@/lib/validators/auth';

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });
  const password = useWatch({ control, name: 'newPassword' }) ?? '';

  async function onSubmit({ currentPassword, newPassword }) {
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        if (error.code === 'INVALID_PASSWORD') {
          setError('currentPassword', { message: 'Current password is incorrect' });
        }
        toast.error(getAuthErrorMessage(error));
        return;
      }
      reset();
      toast.success('Password changed. Other devices have been signed out.');
    } catch {
      toast.error('Cannot reach the server. Check your connection and try again.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          You will stay signed in here; other devices are signed out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField label="Current password" error={errors.currentPassword?.message}>
            <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
          </FormField>
          <div className="flex flex-col gap-2.5">
            <FormField label="New password" error={errors.newPassword?.message}>
              <PasswordInput autoComplete="new-password" {...register('newPassword')} />
            </FormField>
            <PasswordStrengthMeter password={password} />
          </div>
          <FormField label="Confirm new password" error={errors.confirmPassword?.message}>
            <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
