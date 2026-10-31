'use client';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
const toastVars = {
  '--normal-bg': 'rgb(var(--surface))',
  '--normal-text': 'rgb(var(--foreground))',
  '--normal-border': 'rgb(var(--border) / var(--border-strong-alpha))',
  '--success-bg': 'rgb(var(--success-soft))',
  '--success-text': 'rgb(var(--success-text))',
  '--success-border': 'rgb(var(--success))',
  '--error-bg': 'rgb(var(--danger-soft))',
  '--error-text': 'rgb(var(--danger-text))',
  '--error-border': 'rgb(var(--danger))',
  '--warning-bg': 'rgb(var(--warning-soft))',
  '--warning-text': 'rgb(var(--warning-text))',
  '--warning-border': 'rgb(var(--warning))',
  '--info-bg': 'rgb(var(--info-soft))',
  '--info-text': 'rgb(var(--info-text))',
  '--info-border': 'rgb(var(--info))',
  '--border-radius': '10px',
};
export function Toaster() {
  const { theme = 'system' } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="top-right"
      offset={56}
      closeButton
      style={toastVars}
      toastOptions={{ classNames: { toast: 'shadow-raised font-sans' } }}
    />
  );
}
