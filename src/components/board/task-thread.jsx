'use client';

import { SmilePlus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarkdownView } from '@/components/ui/markdown';
import { Textarea } from '@/components/ui/textarea';
import { useTaskThread } from '@/hooks/useTaskThread';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants';
import { formatDueDate } from '@/lib/tasks';
import { cn, timeAgo } from '@/lib/utils';

const REACTIONS = ['👍', '🎉', '❤️', '👀'];

function describeActivity(item, membersById) {
  const { type, meta } = item;
  if (type === 'task.created') return 'created this task';
  if (type === 'task.status_changed') {
    return `moved it from ${STATUS_LABELS[meta.from]} to ${STATUS_LABELS[meta.to]}`;
  }
  if (type === 'task.updated') {
    if (meta.field === 'priority') return `set priority to ${PRIORITY_LABELS[meta.to]}`;
    if (meta.field === 'assignee') {
      return meta.to
        ? `assigned it to ${membersById.get(meta.to)?.name ?? 'someone'}`
        : 'unassigned it';
    }
    if (meta.field === 'dueDate') {
      return meta.to ? `set the due date to ${formatDueDate(meta.to)}` : 'cleared the due date';
    }
    if (meta.field === 'title') return 'renamed the task';
  }
  return type;
}

/** Highlights @mentions of real members inside a comment. */
function CommentBody({ comment }) {
  return <MarkdownView text={comment.body} className="[&_p]:break-words" />;
}

function Comment({ comment, membersById, myId, canWrite, onReact }) {
  const author = membersById.get(comment.author);
  const reactions = Object.entries(comment.reactions ?? {});

  return (
    <li className="flex gap-3">
      <Avatar name={author?.name ?? 'Unknown'} src={author?.image ?? undefined} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{author?.name ?? 'Unknown user'}</span>
          <span className="text-xs text-muted">{timeAgo(comment.createdAt)}</span>
        </p>
        <CommentBody comment={comment} />
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {reactions.map(([emoji, users]) => (
            <button
              key={emoji}
              type="button"
              disabled={!canWrite}
              onClick={() => onReact(comment.id, emoji)}
              aria-pressed={users.includes(myId)}
              aria-label={`${emoji} ${users.length}`}
              className={cn(
                'inline-flex h-6 items-center gap-1 rounded-chip border border-border px-1.5 text-xs transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                users.includes(myId) && 'border-primary/40 bg-primary/[0.12]',
              )}
            >
              <span aria-hidden>{emoji}</span>
              {users.length}
            </button>
          ))}
          {canWrite && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Add reaction">
                  <SmilePlus aria-hidden className="size-4" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="flex min-w-0 gap-1 p-1">
                {REACTIONS.map((emoji) => (
                  <DropdownMenuItem
                    key={emoji}
                    aria-label={`React with ${emoji}`}
                    className="min-h-9 justify-center px-2.5 text-base md:min-h-8"
                    onSelect={() => onReact(comment.id, emoji)}
                  >
                    {emoji}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </li>
  );
}

function Composer({ members, onSubmit, onTyping }) {
  const [text, setText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [sending, setSending] = useState(false);
  const [caret, setCaret] = useState(0);
  const ref = useRef(null);
  const typingTimer = useRef(null);
  const lastTypingSent = useRef(0);

  const fragment = /@([\w.]*)$/.exec(text.slice(0, caret));
  const suggestions = fragment
    ? members.filter((m) => m.name.toLowerCase().includes(fragment[1].toLowerCase())).slice(0, 5)
    : [];

  function stopTyping() {
    clearTimeout(typingTimer.current);
    onTyping(false);
    lastTypingSent.current = 0;
  }

  function handleChange(event) {
    setText(event.target.value);
    setCaret(event.target.selectionStart);
    // Throttled "typing" pings, and a stop signal after a short pause.
    if (Date.now() - lastTypingSent.current > 2000) {
      onTyping(true);
      lastTypingSent.current = Date.now();
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2500);
  }

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  function insertMention(member) {
    const before = text.slice(0, caret).replace(/@([\w.]*)$/, `@${member.name.split(' ')[0]} `);
    setText(before + text.slice(caret));
    setMentions((list) => [...new Set([...list, member.userId])]);
    ref.current.focus();
  }

  async function submit() {
    if (!text.trim() || sending) return;
    setSending(true);
    stopTyping();
    try {
      await onSubmit(text.trim(), mentions);
      setText('');
      setMentions([]);
    } catch {
      toast.error('Could not post the comment');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative flex flex-col gap-2">
      {suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Mention a teammate"
          className="absolute bottom-full z-10 mb-1 w-full rounded-card border border-border-strong bg-elevated p-1 shadow-overlay"
        >
          {suggestions.map((member) => (
            <li key={member.userId} role="option" aria-selected="false">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertMention(member)}
                className="flex h-9 w-full items-center gap-2 rounded-chip px-2 text-left text-sm hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
              >
                <Avatar name={member.name} src={member.image ?? undefined} size="xs" />
                {member.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Textarea
        ref={ref}
        rows={3}
        value={text}
        aria-label="Write a comment"
        placeholder="Leave a comment… type @ to mention someone"
        onChange={handleChange}
        onBlur={stopTyping}
        onSelect={(e) => setCaret(e.target.selectionStart)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-subtle">Ctrl+Enter to send</span>
        <Button size="sm" onClick={submit} loading={sending} disabled={!text.trim()}>
          Comment
        </Button>
      </div>
    </div>
  );
}

/** Comments and activity merged into one timeline, plus the composer. */
export function TaskThread({ taskId, members, membersById, myId, canWrite }) {
  const { comments, activity, loading, typing, addComment, react, sendTyping } =
    useTaskThread(taskId);

  const timeline = useMemo(
    () =>
      [
        ...comments.map((c) => ({ kind: 'comment', at: c.createdAt, data: c })),
        ...activity.map((a) => ({ kind: 'activity', at: a.createdAt, data: a })),
      ].sort((a, b) => new Date(a.at) - new Date(b.at)),
    [comments, activity],
  );

  return (
    <section aria-label="Activity" className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Activity</h3>
      {loading ? (
        <p className="text-xs text-muted">Loading…</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {timeline.map((entry) =>
            entry.kind === 'comment' ? (
              <Comment
                key={`c-${entry.data.id}`}
                comment={entry.data}
                membersById={membersById}
                myId={myId}
                canWrite={canWrite}
                onReact={react}
              />
            ) : (
              <li key={`a-${entry.data.id}`} className="flex items-center gap-3 text-xs text-muted">
                <span aria-hidden className="ml-3 size-1.5 rounded-full bg-subtle" />
                <span>
                  <span className="text-foreground">
                    {membersById.get(entry.data.actor)?.name ?? 'Someone'}
                  </span>{' '}
                  {describeActivity(entry.data, membersById)} · {timeAgo(entry.data.createdAt)}
                </span>
              </li>
            ),
          )}
        </ul>
      )}
      <p aria-live="polite" className="h-4 text-xs text-muted">
        {typing.length > 0 && `${typing.join(', ')} ${typing.length > 1 ? 'are' : 'is'} typing…`}
      </p>
      {canWrite ? (
        <Composer members={members} onSubmit={addComment} onTyping={sendTyping} />
      ) : (
        <p className="text-xs text-muted">Viewers can read but not comment.</p>
      )}
    </section>
  );
}
