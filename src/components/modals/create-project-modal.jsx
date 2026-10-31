'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/store/workspace.store';

const COLORS = ['#5E6AD2', '#4CB782', '#F2C94C', '#EB5757', '#5AAAF0', '#BB87FC'];

export function CreateProjectModal({ open, onOpenChange }) {
  const router = useRouter();
  const createProject = useWorkspaceStore((s) => s.createProject);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Name must be at least 2 characters');
    setError('');
    setLoading(true);
    try {
      const project = await createProject({ name: name.trim(), color });
      toast.success(`Project "${project.name}" created`);
      setName('');
      onOpenChange(false);
      router.push(`/dashboard/projects/${project.id}`);
    } catch {
      // The API client already reported the failure.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New project"
      description="Projects have their own board with To Do, In Progress and Done columns."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form" loading={loading}>
            Create project
          </Button>
        </>
      }
    >
      <form
        id="create-project-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField label="Project name" error={error} required>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website Redesign"
            maxLength={60}
          />
        </FormField>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium">Color</legend>
          <div className="flex gap-2">
            {COLORS.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Color ${value}`}
                aria-pressed={color === value}
                onClick={() => setColor(value)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-chip border border-border-strong transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 md:size-7',
                  color === value && 'ring-2 ring-foreground/60 ring-offset-2 ring-offset-elevated',
                )}
                style={{ backgroundColor: value }}
              >
                {color === value && <Check aria-hidden className="size-3.5 text-black/70" />}
              </button>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
