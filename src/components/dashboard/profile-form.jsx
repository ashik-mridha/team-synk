'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { authClient, getAuthErrorMessage } from '@/lib/auth-client';
import { profileSchema } from '@/lib/validators/auth';

export function ProfileForm({ user }) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  async function onSubmit(values) {
    try {
      const { error } = await authClient.updateUser({ name: values.name });
      if (error) {
        setError('name', { message: getAuthErrorMessage(error) });
        toast.error(getAuthErrorMessage(error));
        return;
      }
      reset({ name: values.name });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your name is visible to teammates.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.image ?? undefined} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <FormField label="Full name" error={errors.name?.message}>
            <Input autoComplete="name" {...register('name')} />
          </FormField>
          <FormField label="Email" hint="Email cannot be changed.">
            <Input type="email" value={user.email} readOnly disabled />
          </FormField>
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!isDirty}
              className="w-full sm:w-auto"
            >
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
