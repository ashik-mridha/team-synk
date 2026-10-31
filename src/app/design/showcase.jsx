'use client';

import { Archive, Bell, Inbox, LayoutDashboard, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ColumnHeader } from '@/components/board/board-column';
import { TaskCardView } from '@/components/board/task-card';
import { SidebarItem } from '@/components/layout/sidebar-item';
import { BarList, ColumnChart } from '@/components/dashboard/charts';
import { MarkdownView } from '@/components/ui/markdown';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Badge, LabelBadge, PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip, DashedChip } from '@/components/ui/chip';
import { ComingSoon } from '@/components/ui/coming-soon';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Drawer } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal, ModalClose } from '@/components/ui/modal';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tooltip } from '@/components/ui/tooltip';
import { Priority, TaskStatus } from '@/lib/constants';

const team = [
  { name: 'Rahim Uddin', online: true },
  { name: 'Nadia Karim', online: true },
  { name: 'Tanvir Hasan', online: false },
  { name: 'Mira Das' },
  { name: 'Arif Chowdhury' },
];

const sampleTask = (overrides) => ({
  id: 'demo',
  number: 12,
  title: 'Better error handling',
  priority: Priority.HIGH,
  status: TaskStatus.IN_PROGRESS,
  dueDate: null,
  labels: ['frontend', 'bug', 'urgent'],
  subtasks: [
    { id: '1', title: 'Reproduce', done: true },
    { id: '2', title: 'Fix', done: false },
  ],
  commentCount: 3,
  ...overrides,
});

const SAMPLE_MARKDOWN = [
  '## Release checklist',
  'Ship **v1.2** with `feature-flag` and a [changelog](https://example.com).',
  '',
  '- [x] Write the changelog',
  '- [ ] Announce to the team',
  '',
  '- first item',
  '- second item',
].join('\n');

const swatches = [
  ['background', 'bg-background'],
  ['sidebar', 'bg-sidebar'],
  ['surface', 'bg-surface'],
  ['surface-muted', 'bg-surface-muted'],
  ['elevated', 'bg-elevated'],
  ['border', 'bg-border'],
  ['border-strong', 'bg-border-strong'],
  ['foreground', 'bg-foreground'],
  ['muted', 'bg-muted'],
  ['subtle', 'bg-subtle'],
  ['primary', 'bg-primary'],
  ['primary-soft', 'bg-primary-soft'],
  ['success', 'bg-success'],
  ['warning', 'bg-warning'],
  ['danger', 'bg-danger'],
  ['info', 'bg-info'],
];

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-base">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function ShowcaseBody() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [checked, setChecked] = useState(true);

  const demo = (label) => () => {
    setClicks((n) => n + 1);
    toast(`${label} clicked`);
  };

  function save() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Saved');
    }, 1200);
  }

  return (
    <div className="flex min-w-0 flex-col gap-10">
      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-3 xs:grid-cols-3 sm:grid-cols-4">
          {swatches.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className={`h-12 rounded-input border border-border-strong ${cls}`} />
              <span className="font-mono text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-semibold">Heading · Inter 600, tight tracking</p>
          <p className="text-base font-semibold">Subheading</p>
          <p>Body text at 13px. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-xs text-muted">Meta text at 12px, secondary color.</p>
          <p lang="bn">বাংলা লেখা Hind Siliguri ফন্টে দেখা যাবে।</p>
          <p className="font-mono text-xs text-muted">mono · JetBrains Mono · TS-1042</p>
        </div>
      </Section>

      <Section title="Buttons">
        <Row>
          <Button onClick={demo('Primary')}>Primary</Button>
          <Button variant="secondary" onClick={demo('Secondary')}>
            Secondary
          </Button>
          <Button variant="ghost" onClick={demo('Ghost')}>
            Ghost
          </Button>
          <Button variant="outline" onClick={demo('Outline')}>
            Outline
          </Button>
          <Button variant="danger" onClick={demo('Danger')}>
            Danger
          </Button>
          <Tooltip content="Icon button">
            <Button size="icon" aria-label="Add" onClick={demo('Icon')}>
              <Plus aria-hidden className="size-4" />
            </Button>
          </Tooltip>
        </Row>
        <Row>
          <Button size="sm" onClick={demo('Small')}>
            Small
          </Button>
          <Button size="md" onClick={demo('Medium')}>
            Medium
          </Button>
          <Button size="lg" onClick={demo('Large')}>
            Large
          </Button>
          <Button loading={saving} onClick={save}>
            {saving ? 'Saving' : 'Click to save'}
          </Button>
          <Button disabled>Disabled</Button>
          <span aria-live="polite" className="text-xs text-muted">
            {clicks} demo clicks
          </span>
        </Row>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Task title" hint="Keep it short and actionable." required>
            <Input placeholder="Design landing page" />
          </FormField>
          <FormField label="Email" error="Enter a valid email address.">
            <Input type="email" defaultValue="rahim@" />
          </FormField>
          <FormField label="Priority">
            <Select defaultValue="medium">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>
          <FormField label="Password">
            <PasswordInput defaultValue="Passw0rd123" />
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea placeholder="Add more detail…" />
          </FormField>
          <div className="flex flex-col sm:col-span-2">
            <Checkbox
              label="Notify assignees"
              description="They get a notification when the task changes."
              checked={checked}
              onCheckedChange={(value) => setChecked(value === true)}
            />
            <Checkbox label="Disabled option" disabled />
          </div>
        </div>
      </Section>

      <Section title="Chips and badges">
        <Row>
          <Chip>Default chip</Chip>
          <Chip as="button" onClick={demo('Interactive chip')}>
            Interactive chip
          </Chip>
          <DashedChip onClick={demo('Filter chip')}>
            <Plus aria-hidden className="size-3.5" /> Filter
          </DashedChip>
          <LabelBadge>frontend</LabelBadge>
        </Row>
        <Row>
          <PriorityBadge priority={Priority.LOW} />
          <PriorityBadge priority={Priority.MEDIUM} />
          <PriorityBadge priority={Priority.HIGH} />
          <StatusBadge status={TaskStatus.TODO} />
          <StatusBadge status={TaskStatus.IN_PROGRESS} />
          <StatusBadge status={TaskStatus.DONE} />
          <Badge tone="info">Info</Badge>
        </Row>
      </Section>

      <Section title="Avatars and presence">
        <Row>
          <Avatar name="Rahim Uddin" size="xs" />
          <Avatar name="Nadia Karim" size="sm" online />
          <Avatar name="Tanvir Hasan" size="md" online={false} />
          <Avatar name="Mira Das" size="lg" online />
        </Row>
        <AvatarGroup users={team} max={4} />
      </Section>

      <Section title="Board column and task cards">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <ColumnHeader
              status={TaskStatus.TODO}
              title="To Do"
              count={4}
              onAdd={demo('Add task')}
              onSelectAll={demo('Select all')}
            />
            <ColumnHeader
              status={TaskStatus.IN_PROGRESS}
              title="In Progress"
              count={5}
              onAdd={demo('Add task')}
              onSelectAll={demo('Select all')}
            />
            <ColumnHeader
              status={TaskStatus.DONE}
              title="Done"
              count={2}
              onAdd={demo('Add task')}
              onSelectAll={demo('Select all')}
            />
          </div>
          <div className="flex flex-col gap-2">
            <TaskCardView
              task={sampleTask({ title: 'Default card', dueDate: '2030-01-15' })}
              projectKey="WR"
              assignee={team[0]}
              onClick={demo('Task card')}
            />
            <TaskCardView
              task={sampleTask({ title: 'Hover state', priority: Priority.MEDIUM })}
              projectKey="WR"
              assignee={team[1]}
              className="bg-surface-muted"
            />
            <TaskCardView
              task={sampleTask({ title: 'Selected card', priority: Priority.LOW })}
              projectKey="WR"
              assignee={team[2]}
              selected
            />
            <TaskCardView
              task={sampleTask({ title: 'Dragging (placeholder)' })}
              projectKey="WR"
              assignee={team[3]}
              dragging
            />
            <TaskCardView
              task={sampleTask({ title: 'Lifted while dragging', dueDate: '2020-01-01' })}
              projectKey="WR"
              assignee={team[4]}
              lifted
            />
          </div>
        </div>
      </Section>

      <Section title="Charts and rich text">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <BarList
              title="Tasks by status"
              rows={[
                { label: 'To Do', value: 12, className: 'bg-column-todo' },
                { label: 'In Progress', value: 7, className: 'bg-column-progress' },
                { label: 'Done', value: 19, className: 'bg-column-done' },
              ]}
            />
          </Card>
          <Card className="p-5">
            <ColumnChart
              title="Completed per week"
              valueLabel="completed"
              points={[3, 5, 2, 8, 6, 9, 4, 11].map((value, i) => ({ label: `W${i + 1}`, value }))}
            />
          </Card>
        </div>
        <Card className="p-5">
          <MarkdownView text={SAMPLE_MARKDOWN} onChange={() => toast('Checklist toggled')} />
        </Card>
      </Section>

      <Section title="Sidebar item states">
        <div className="flex w-full max-w-64 flex-col gap-0.5 rounded-card border border-border bg-sidebar p-2">
          <SidebarItem icon={Search} onClick={demo('Search item')}>
            Default
          </SidebarItem>
          <SidebarItem
            icon={Inbox}
            className="bg-surface-muted text-foreground"
            onClick={demo('Hover item')}
          >
            Hover
          </SidebarItem>
          <SidebarItem icon={LayoutDashboard} active onClick={demo('Active item')}>
            Active
          </SidebarItem>
          <ComingSoon className="w-full">
            <SidebarItem icon={Archive} tabIndex={-1} className="pointer-events-none">
              Coming soon
            </SidebarItem>
          </ComingSoon>
        </div>
      </Section>

      <Section title="Cards and tabs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sprint 14</CardTitle>
              <CardDescription>12 tasks · ends Friday</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <PriorityBadge priority={Priority.HIGH} />
              <AvatarGroup users={team} max={3} size="xs" />
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline" onClick={demo('Open board')}>
                Open board
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col gap-3 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </Card>
        </div>
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <TabsContent value="board">Kanban board view.</TabsContent>
          <TabsContent value="list">Table list view.</TabsContent>
          <TabsContent value="activity">Recent activity feed.</TabsContent>
          <TabsContent value="members">Project members.</TabsContent>
        </Tabs>
      </Section>

      <Section title="Overlays and feedback">
        <Row>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden className="size-4" /> Delete
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Task</DropdownMenuLabel>
              <DropdownMenuItem onSelect={demo('Edit')}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={demo('Duplicate')}>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={demo('Delete')}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip content="Notifications">
            <Button variant="ghost" size="icon" aria-label="Notifications" onClick={demo('Bell')}>
              <Bell aria-hidden className="size-4" strokeWidth={1.5} />
            </Button>
          </Tooltip>
          <ThemeToggle />
        </Row>
        <Row>
          <Button variant="outline" onClick={() => toast.success('Task saved')}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => toast.error('Could not save task')}>
            Error toast
          </Button>
          <Button variant="outline" onClick={() => toast.info('3 new comments')}>
            Info toast
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Connection unstable')}>
            Warning toast
          </Button>
          <Spinner label="Loading tasks" />
        </Row>
        <EmptyState
          icon={Inbox}
          title="No tasks yet"
          description="Create your first task to start planning this project."
          action={
            <Button onClick={demo('New task')}>
              <Plus aria-hidden className="size-4" /> New task
            </Button>
          }
        />
      </Section>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Create task"
        description="Add a new task to the To Do column."
        footer={
          <>
            <ModalClose asChild>
              <Button variant="ghost">Cancel</Button>
            </ModalClose>
            <Button
              onClick={() => {
                setModalOpen(false);
                toast.success('Task created');
              }}
            >
              Create task
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Title" required>
            <Input placeholder="What needs to be done?" />
          </FormField>
          <FormField label="Description">
            <Textarea />
          </FormField>
        </div>
      </Modal>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Task details"
        description="Full screen on phones, side panel on larger screens."
      >
        <div className="flex flex-col gap-4">
          <StatusBadge status={TaskStatus.IN_PROGRESS} />
          <FormField label="Assignee">
            <Select>
              {team.map((member) => (
                <option key={member.name}>{member.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Notes">
            <Textarea rows={6} />
          </FormField>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this task?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
      />
    </div>
  );
}

export function Showcase() {
  const [mode, setMode] = useState('current');

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="current">Current theme</TabsTrigger>
          <TabsTrigger value="compare">Light vs dark</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === 'current' ? (
        <ShowcaseBody />
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-2">
          {['light', 'dark'].map((theme) => (
            <div
              key={theme}
              className={`${theme} min-w-0 rounded-card border border-border bg-background p-4 text-foreground sm:p-6`}
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted">
                {theme}
              </p>
              <ShowcaseBody />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
