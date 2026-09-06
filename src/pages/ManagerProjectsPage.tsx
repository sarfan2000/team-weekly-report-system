import { useState } from 'react';
import { Plus, Trash2, Archive, FolderKanban, Edit3, X } from 'lucide-react';
import { useProjects, createProject, updateProject, deleteProject } from '@/lib/hooks';
import { Button, Card, Input, Textarea, Select, Spinner, EmptyState, ProjectTag } from '@/components/ui';
import type { Project } from '@/lib/types';

const COLOR_OPTIONS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#0891b2', '#dc2626', '#ca8a04', '#475569'];

export function ManagerProjectsPage() {
  const { projects, loading, refresh } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [archived, setArchived] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const openNew = () => {
    setEditing(null); setName(''); setDescription(''); setColor(COLOR_OPTIONS[0]); setArchived(false); setShowForm(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p); setName(p.name); setDescription(p.description); setColor(p.color); setArchived(p.archived); setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updateProject(editing.id, { name, description, color, archived });
    } else {
      await createProject(name, description, color);
    }
    setShowForm(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    refresh();
  };

  const handleToggleArchive = async (p: Project) => {
    await updateProject(p.id, { archived: !p.archived });
    refresh();
  };

  if (loading) return <Spinner />;

  const visible = projects.filter((p) => showArchived || !p.archived);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage project categories for reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={showArchived ? '1' : '0'} onChange={(v) => setShowArchived(v === '1')} options={[{ value: '0', label: 'Active only' }, { value: '1', label: 'Show archived' }]} />
          <Button onClick={openNew}><Plus className="w-4 h-4" /> New Project</Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card><EmptyState icon={<FolderKanban className="w-12 h-12" />} title="No projects yet" subtitle="Create your first project to get started." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <Card key={p.id} className={`p-5 ${p.archived ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <ProjectTag name={p.name} color={p.color} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleArchive(p)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Archive className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{p.description || 'No description'}</p>
              {p.archived && <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">Archived</span>}
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input value={name} onChange={setName} placeholder="Project name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea value={description} onChange={setDescription} placeholder="Brief description" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              {editing && (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} className="w-4 h-4 rounded" />
                  Archived
                </label>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!name.trim()}>{editing ? 'Update' : 'Create'}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
