import { useState } from 'react';
import { Plus, Trash2, UserCog, X, Shield, User } from 'lucide-react';
import { useUsers, createUser, updateUser, deleteUser } from '@/lib/hooks';
import { Button, Card, Input, Select, Avatar, Spinner, EmptyState, Pagination } from '@/components/ui';
import type { User as UserType } from '@/lib/types';

export function AdminUsersPage() {
  const { users, loading, refresh } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [role, setRole] = useState('team_member');
  const [department, setDepartment] = useState('Engineering');
  const [createdUserAuth, setCreatedUserAuth] = useState<{ email: string, password: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const openNew = () => { setEditing(null); setName(''); setEmail(''); setPhone(''); setManualPassword(''); setRole('team_member'); setDepartment('Engineering'); setShowForm(true); setCreatedUserAuth(null); };
  const openEdit = (u: UserType) => { setEditing(u); setName(u.name); setEmail(u.email); setPhone(u.phoneNumber || ''); setRole(u.role); setDepartment(u.department || 'Engineering'); setShowForm(true); setCreatedUserAuth(null); };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    if (!editing && !manualPassword.trim()) return;
    try {
      if (editing) {
        await updateUser(editing.id, { name, email, phoneNumber: phone, role: role as 'team_member' | 'manager', department });
        setShowForm(false);
      } else {
        const res: any = await createUser(name, email, role, department, phone, manualPassword || undefined);
        if (res && res.generatedPassword) {
          setCreatedUserAuth({ email, password: res.generatedPassword });
        } else if (manualPassword) {
          setCreatedUserAuth({ email, password: manualPassword });
        } else {
          setShowForm(false);
        }
      }
      refresh();
    } catch (e) {
      console.error(e);
      alert('Error saving user');
    }
  };

  const handleDelete = async (id: string) => { await deleteUser(id); refresh(); };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and their roles</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Add User</Button>
      </div>

      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <EmptyState icon={<UserCog className="w-12 h-12" />} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} size="sm" />
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.department}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'manager' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role === 'manager' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role === 'manager' ? 'Manager' : 'Member'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => handleDelete(u.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit User' : 'Add User'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {createdUserAuth ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg">
                  <p className="font-semibold mb-2">User Created Successfully!</p>
                  <p className="text-sm">Please copy these credentials and send them to the user:</p>
                  <div className="text-sm font-mono mt-3 space-y-1 bg-white p-3 rounded border border-emerald-100">
                    <p><span className="font-semibold text-gray-500">Email:</span> {createdUserAuth.email}</p>
                    <p><span className="font-semibold text-gray-500">Password:</span> {createdUserAuth.password}</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowForm(false)}>Done</Button>
              </div>
            ) : (
              <form className="space-y-4" autoComplete="off">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label><Input value={name} onChange={setName} placeholder="Full name" autoComplete="off" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label><Input value={email} onChange={setEmail} placeholder="email@company.com" type="email" autoComplete="off" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><Input value={phone} onChange={setPhone} placeholder="+94 7X XXX XXXX" type="tel" autoComplete="off" /></div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                    <Input value={manualPassword} onChange={setManualPassword} placeholder="Enter password" type="password" autoComplete="new-password" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <Select value={role} onChange={setRole} options={[{ value: 'team_member', label: 'Team Member' }, { value: 'manager', label: 'Manager' }]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <Select value={department} onChange={setDepartment} options={['Engineering', 'Design', 'Management', 'QA', 'Product', 'Marketing'].map((d) => ({ value: d, label: d }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={!name.trim() || !email.trim() || (!editing && !manualPassword.trim())}>{editing ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
