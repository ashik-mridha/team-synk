import Link from 'next/link';
import { StatusPage } from '@/components/layout/status-page';
import { buttonVariants } from '@/components/ui/button';
export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The page you are looking for does not exist or has been moved."
    >
      <Link href="/" className={buttonVariants({ size: 'lg' })}>
        Back to home
      </Link>
      <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
        Go to dashboard
      </Link>
    </StatusPage>
  );
}
