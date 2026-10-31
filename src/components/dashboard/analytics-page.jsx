'use client';

import { AlertTriangle, BarChart3, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarList, ColumnChart } from '@/components/dashboard/charts';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { PRIORITY_LABELS, Priority, STATUS_LABELS, TaskStatus } from '@/lib/constants';
import { selectCurrentWorkspace, useWorkspaceStore } from '@/store/workspace.store';

const weekFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

const STATUS_BARS = {
  [TaskStatus.TODO]: 'bg-column-todo',
  [TaskStatus.IN_PROGRESS]: 'bg-column-progress',
  [TaskStatus.DONE]: 'bg-column-done',
};

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        className={`flex size-9 items-center justify-center rounded-input bg-surface-muted ${tone ?? 'text-muted'}`}
      >
        <Icon aria-hidden className="size-4" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const workspace = useWorkspaceStore(selectCurrentWorkspace);
  const status = useWorkspaceStore((s) => s.status);
  const workspaceId = workspace?.id;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    api
      .get(`/workspaces/${workspaceId}/analytics`)
      .then((res) => !cancelled && setData(res.data.data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (status === 'ready' && !workspace) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No workspace yet"
        description="Create a workspace to see analytics."
      />
    );
  }
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-card" />
        ))}
      </div>
    );
  }

  const open = data.byStatus[TaskStatus.TODO] + data.byStatus[TaskStatus.IN_PROGRESS];
  const weeks = data.completedPerWeek.map((w) => ({
    label: weekFormat.format(new Date(w.week)),
    value: w.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">Analytics</h1>
        <p className="text-muted">{workspace.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={ListTodo} label="Open tasks" value={open} />
        <Stat
          icon={CheckCircle2}
          label="Completed (all time)"
          value={data.byStatus[TaskStatus.DONE]}
          tone="text-success-text"
        />
        <Stat
          icon={AlertTriangle}
          label="Overdue"
          value={data.overdue}
          tone={data.overdue ? 'text-danger-text' : 'text-muted'}
        />
        <Stat
          icon={Clock}
          label="Avg. cycle time"
          value={data.avgCycleTimeDays === null ? '–' : `${data.avgCycleTimeDays}d`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <BarList
            title="Tasks by status"
            rows={Object.values(TaskStatus).map((s) => ({
              label: STATUS_LABELS[s],
              value: data.byStatus[s],
              className: STATUS_BARS[s],
            }))}
          />
        </Card>
        <Card className="p-5">
          <BarList
            title="Tasks by priority"
            rows={[Priority.HIGH, Priority.MEDIUM, Priority.LOW].map((p) => ({
              label: PRIORITY_LABELS[p],
              value: data.byPriority[p],
            }))}
          />
        </Card>
        <Card className="p-5">
          <ColumnChart title="Completed per week" points={weeks} valueLabel="completed" />
        </Card>
        <Card className="p-5">
          <BarList
            title="Open workload per member"
            rows={data.workload.map((w) => ({ label: w.name, value: w.count }))}
            emptyText="No open tasks are assigned yet"
          />
        </Card>
      </div>
    </div>
  );
}
