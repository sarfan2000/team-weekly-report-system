import { type ReactNode } from 'react';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, TASK_STATUS_COLORS, type ReportStatus, type Priority, type TaskStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}>{priority}</span>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TASK_STATUS_COLORS[status]}`}>{status}</span>;
}

export function ProjectTag({ name, color }: { name: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color || '#999' }} />
      {name}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean; type?: 'button' | 'submit'; className?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type = 'text', disabled, className = '', autoComplete }: {
  value: string | number; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean; className?: string; autoComplete?: string;
}) {
  return (
    <input type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} placeholder={placeholder} disabled={disabled} autoComplete={autoComplete}
      className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${className}`} />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, disabled }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; rows?: number; disabled?: boolean;
}) {
  return (
    <textarea value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} placeholder={placeholder} rows={rows} disabled={disabled}
      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-y" />
  );
}

export function Select({ value, onChange, options, disabled, className = '' }: {
  value: string; onChange?: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean; className?: string;
}) {
  return (
    <select value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} disabled={disabled}
      className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${className}`}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full animate-spin" style={{ borderWidth: '3px', borderColor: '#bfdbfe', borderTopColor: '#2563eb' }} />
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon?: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 text-gray-400">{icon}</div>}
      <p className="text-gray-500 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const sizes: Record<string, string> = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>{initials}</div>;
}
