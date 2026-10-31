'use client';
import Link from 'next/link';
import { StatusPage } from '@/components/layout/status-page';
import { Button, buttonVariants } from '@/components/ui/button';
export default function ErrorPage({ reset }) {
  return (
    <StatusPage
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or head back home."
    >
      <Button size="lg" onClick={reset}>
        Try again
      </Button>
      <Link href="/" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
        Back to home
      </Link>
    </StatusPage>
  );
}
