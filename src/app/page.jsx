import { KanbanSquare, Users, Zap } from 'lucide-react';
import { ColumnHeader } from '@/components/board/board-column';
import { TaskCardView } from '@/components/board/task-card';
import { CtaActions, HeaderActions, HeroActions } from '@/components/landing/landing-actions';
import { Logo } from '@/components/layout/logo';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Priority, TaskStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';
const features = [
  {
    icon: Zap,
    title: 'Real-time by default',
    description:
      'Every move, comment and update appears instantly for your whole team. No refreshing, no conflicts.',
  },
  {
    icon: KanbanSquare,
    title: 'Boards that flow',
    description:
      'Drag tasks across columns, set priorities and due dates, and keep every project moving.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    description:
      'Invite teammates, assign work and see who is online, with roles that keep projects secure.',
  },
];
const board = [
  {
    status: TaskStatus.TODO,
    title: 'To Do',
    cards: [
      { title: 'Draft launch announcement', priority: Priority.MEDIUM, who: 'Nadia Karim' },
      { title: 'Audit onboarding emails', priority: Priority.LOW, who: 'Tanvir Hasan' },
    ],
  },
  {
    status: TaskStatus.IN_PROGRESS,
    title: 'In Progress',
    cards: [
      { title: 'Redesign pricing page', priority: Priority.HIGH, who: 'Rahim Uddin' },
      { title: 'Fix mobile nav overflow', priority: Priority.HIGH, who: 'Mira Das' },
    ],
  },
  {
    status: TaskStatus.DONE,
    title: 'Done',
    cards: [
      { title: 'Set up analytics', priority: Priority.LOW, who: 'Tanvir Hasan' },
      { title: 'Customer interviews', priority: Priority.MEDIUM, who: 'Rahim Uddin' },
    ],
  },
];

function BoardPreview() {
  let number = 0;
  return (
    <div
      aria-hidden
      inert
      className="rounded-xl border border-border-strong bg-sidebar p-3 shadow-overlay sm:p-4"
    >
      <div className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-danger/70" />
        <span className="size-2.5 rounded-full bg-warning/80" />
        <span className="size-2.5 rounded-full bg-success/70" />
        <span className="ml-3 text-xs text-muted">Website Redesign · Board</span>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {board.map((column, index) => (
          <div
            key={column.title}
            className={cn('flex-col gap-3', index === 0 ? 'flex' : 'hidden sm:flex')}
          >
            <ColumnHeader status={column.status} title={column.title} count={column.cards.length} />
            {column.cards.map((card) => (
              <TaskCardView
                key={card.title}
                task={{ ...card, status: column.status, number: ++number, id: card.title }}
                projectKey="WR"
                assignee={{ name: card.who }}
                className="pointer-events-none"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="pb-safe relative isolate overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(var(--primary)/0.16),transparent)]"
      />

      <header className="pt-safe mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <HeaderActions />
        </div>
      </header>

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium shadow-soft">
              <span className="size-1.5 rounded-full bg-success" />
              Real-time project management
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              Ship projects faster,{' '}
              <span className="bg-gradient-to-r from-primary-solid to-accent bg-clip-text text-transparent">
                together
              </span>
              .
            </h1>
            <p className="max-w-xl text-balance text-base text-muted sm:text-lg">
              TeamSync keeps your whole team on the same page with live boards, clear priorities and
              zero busywork. Plan, track and deliver in one calm workspace.
            </p>
            <HeroActions />
          </div>

          <div className="w-full max-w-4xl">
            <BoardPreview />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mb-10 flex flex-col gap-3 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Everything your team needs to stay in sync
            </h2>
            <p className="mx-auto max-w-xl text-muted">
              A focused toolkit that gets out of the way, so work keeps moving.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="transition-shadow duration-200 hover:shadow-raised">
                <CardHeader className="gap-4">
                  <span className="flex size-11 items-center justify-center rounded-input bg-primary-soft text-primary-text">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="leading-relaxed">{description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-primary-solid to-[#3F46A0] px-6 py-12 text-center text-white shadow-raised sm:px-12 sm:py-16">
            <h2 className="max-w-xl text-balance text-2xl font-semibold text-white sm:text-3xl">
              Bring your team into one workspace today
            </h2>
            <p className="max-w-md text-white/85">
              Free to start. Set up your first board in under a minute.
            </p>
            <CtaActions />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <Logo textClassName="text-base text-foreground" />
          <p>© {new Date().getFullYear()} TeamSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
