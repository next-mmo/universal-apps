import { useState, useMemo } from 'react';
import {
  PlusIcon,
  DownloadIcon,
  Trash2Icon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  CheckSquareIcon,
  EyeIcon,
  Edit2Icon,
  AlertTriangleIcon,
} from 'lucide-react';
import { PageContainer } from '@package/pro/page-container';
import { ProFilterToolbar, type FilterField } from '@package/pro/filter-toolbar';
import { ProFormDialog } from '@package/pro/form-dialog';
import { ProFormDrawer } from '@package/pro/form-drawer';
import {
  Card,
  CardContent,
} from '@package/ui/card';
import { Button } from '@package/ui/button';
import { Badge } from '@package/ui/badge';
import { Input } from '@package/ui/input';
import { Checkbox } from '@package/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@package/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@package/ui/dialog';
import { toast } from '@package/ui/toast';
import { useAccess, Access } from '../../access';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  department: string;
  status: 'active' | 'suspended' | 'pending';
  tier: 'Enterprise' | 'Scale' | 'Starter';
  lastActive: string;
}

const INITIAL_USERS: UserRow[] = [
  {
    id: 'usr_01',
    name: 'Seraphina Vance',
    email: 'seraphina.vance@acme.corp',
    role: 'admin',
    department: 'Infrastructure',
    status: 'active',
    tier: 'Enterprise',
    lastActive: 'Just now',
  },
  {
    id: 'usr_02',
    name: 'Marcus Chen',
    email: 'marcus.chen@acme.corp',
    role: 'editor',
    department: 'Product Operations',
    status: 'active',
    tier: 'Enterprise',
    lastActive: '14m ago',
  },
  {
    id: 'usr_03',
    name: 'Elena Rostova',
    email: 'elena.rostova@acme.corp',
    role: 'user',
    department: 'Business Intelligence',
    status: 'active',
    tier: 'Scale',
    lastActive: '1h ago',
  },
  {
    id: 'usr_04',
    name: 'Julian Hayes',
    email: 'julian.hayes@partner.net',
    role: 'user',
    department: 'Contractor',
    status: 'pending',
    tier: 'Starter',
    lastActive: '2d ago',
  },
  {
    id: 'usr_05',
    name: 'Amira Tanaka',
    email: 'amira.tanaka@acme.corp',
    role: 'editor',
    department: 'Security Engineering',
    status: 'active',
    tier: 'Enterprise',
    lastActive: '3h ago',
  },
  {
    id: 'usr_06',
    name: 'Damon Bradley',
    email: 'damon.bradley@oldclient.org',
    role: 'user',
    department: 'Auditing',
    status: 'suspended',
    tier: 'Starter',
    lastActive: '30d ago',
  },
  {
    id: 'usr_07',
    name: 'Clara Oswald',
    email: 'clara.oswald@acme.corp',
    role: 'admin',
    department: 'Executive Office',
    status: 'active',
    tier: 'Enterprise',
    lastActive: '5h ago',
  },
];

const FILTER_FIELDS: FilterField[] = [
  { name: 'query', label: 'Search Keyword', type: 'text', placeholder: 'Name, email, or department…' },
  {
    name: 'role',
    label: 'User Role',
    type: 'select',
    options: [
      { label: 'All Roles', value: '' },
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'User', value: 'user' },
    ],
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'All Statuses', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Pending', value: 'pending' },
    ],
  },
];

const USER_FORM_SCHEMA = [
  {
    title: 'Identity & Access',
    description: 'Basic account details and security level',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text' as const, required: true, placeholder: 'e.g. Liam Vance' },
      { name: 'email', label: 'Work Email', type: 'text' as const, required: true, placeholder: 'liam@acme.corp' },
      {
        name: 'role',
        label: 'Role Assignment',
        type: 'select' as const,
        required: true,
        options: [
          { label: 'Viewer / User', value: 'user' },
          { label: 'Editor', value: 'editor' },
          { label: 'Full Admin', value: 'admin' },
        ],
      },
      { name: 'department', label: 'Department', type: 'text' as const, placeholder: 'e.g. SRE / FinOps' },
    ],
  },
];

export default function TableListPage() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [density, setDensity] = useState<'compact' | 'default' | 'relaxed'>('default');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    role: true,
    department: true,
    status: true,
    tier: true,
    lastActive: true,
  });

  // Modal / Drawer states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [activeEditingUser, setActiveEditingUser] = useState<UserRow | null>(null);

  // Destructive delete confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const { canDelete, canExport } = useAccess();

  // Filtered rows
  const filteredRows = useMemo(() => {
    return users.filter((u) => {
      const q = (filters.query as string)?.toLowerCase();
      if (q) {
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;
      return true;
    });
  }, [users, filters]);

  // Selection
  const allSelected = filteredRows.length > 0 && selectedIds.length === filteredRows.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleExportCSV = () => {
    const targets = selectedIds.length > 0
      ? filteredRows.filter((r) => selectedIds.includes(r.id))
      : filteredRows;
    const csvContent =
      'id,name,email,role,department,status,tier\n' +
      targets.map((u) => `${u.id},${u.name},${u.email},${u.role},${u.department},${u.status},${u.tier}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${Date.now()}.csv`;
    a.click();
    toast.success(`Exported ${targets.length} users to CSV`);
  };

  const handleBatchStatusToggle = () => {
    setUsers((prev) =>
      prev.map((u) =>
        selectedIds.includes(u.id)
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
    toast.success(`Updated status for ${selectedIds.length} users`);
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    toast.success(`Deleted ${selectedIds.length} users`);
    setSelectedIds([]);
  };

  const handleOpenEdit = (user: UserRow) => {
    setActiveEditingUser(user);
    setEditDrawerOpen(true);
  };

  const handleOpenDelete = (user: UserRow) => {
    setUserToDelete(user);
    setConfirmInput('');
    setDeleteConfirmOpen(true);
  };

  const confirmDestructiveDelete = () => {
    if (userToDelete && confirmInput === 'DELETE') {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success(`Permanently removed user ${userToDelete.name}`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <PageContainer
      title="User & Access Directory"
      description="Ant Design Pro-style query filter, column visibility, density controls, batch actions, and drawer editing."
      breadcrumbs={['Universal Pro', 'Data Management', 'Table List']}
      extra={
        <div className="flex items-center gap-2">
          <Access accessible={canExport}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 gap-1.5 text-xs border-border/70"
            >
              <DownloadIcon className="size-3.5" />
              <span>Export CSV</span>
            </Button>
          </Access>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <PlusIcon className="size-3.5" />
            <span>New User</span>
          </Button>
        </div>
      }
    >
      {/* Query Filter Toolbar */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="pt-5 pb-4">
          <ProFilterToolbar
            fields={FILTER_FIELDS}
            onFilter={(f) => setFilters(f)}
            onReset={() => setFilters({})}
            searchLabel="Filter"
          />
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        {/* Table Power Toolbar (AntD ProTable Bar) */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/70 px-4 py-2.5 bg-muted/20 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Directory Records ({filteredRows.length})
            </span>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="text-[11px] px-2 py-0">
                {selectedIds.length} selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Density Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                  <SlidersHorizontalIcon className="size-3.5" />
                  <span>Density</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setDensity('compact')} className="text-xs">
                  Compact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDensity('default')} className="text-xs">
                  Default
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDensity('relaxed')} className="text-xs">
                  Relaxed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                  <EyeIcon className="size-3.5" />
                  <span>Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                  Visible Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(visibleColumns).map((col) => (
                  <label
                    key={col}
                    className="flex items-center gap-2 px-2 py-1 text-xs cursor-pointer hover:bg-muted rounded"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [col]: e.target.checked }))
                      }
                      className="size-3.5 rounded border-border"
                    />
                    <span className="capitalize">{col}</span>
                  </label>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reload Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUsers(INITIAL_USERS);
                toast.success('Directory records refreshed');
              }}
              className="size-7 p-0 text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RotateCcwIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Floating Batch Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-primary/10 border-b border-primary/20 px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckSquareIcon className="size-4 text-primary" />
              <span className="font-semibold text-primary">
                Selected {selectedIds.length} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchStatusToggle}
                className="h-7 text-xs bg-background"
              >
                Toggle Status
              </Button>
              <Access accessible={canExport}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-7 text-xs bg-background"
                >
                  Export Selected
                </Button>
              </Access>
              <Access accessible={canDelete}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="h-7 text-xs"
                >
                  Delete Selected
                </Button>
              </Access>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/70 select-none">
              <tr>
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                </th>
                {visibleColumns.name && <th className="px-4 py-3">User Name</th>}
                {visibleColumns.email && <th className="px-4 py-3">Email</th>}
                {visibleColumns.role && <th className="px-4 py-3">Role</th>}
                {visibleColumns.department && <th className="px-4 py-3">Department</th>}
                {visibleColumns.tier && <th className="px-4 py-3">Tier</th>}
                {visibleColumns.status && <th className="px-4 py-3">Status</th>}
                {visibleColumns.lastActive && <th className="px-4 py-3">Last Active</th>}
                <th className="px-4 py-3 text-right sticky right-0 bg-muted/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                const py = density === 'compact' ? 'py-1.5' : density === 'relaxed' ? 'py-4' : 'py-2.5';

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className={`px-4 ${py}`}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(user.id)}
                      />
                    </td>
                    {visibleColumns.name && (
                      <td className={`px-4 ${py} font-semibold text-foreground`}>
                        {user.name}
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td className={`px-4 ${py} text-muted-foreground`}>
                        {user.email}
                      </td>
                    )}
                    {visibleColumns.role && (
                      <td className={`px-4 ${py}`}>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'outline'}
                          className="text-[10px] px-1.5 py-0 capitalize font-medium"
                        >
                          {user.role}
                        </Badge>
                      </td>
                    )}
                    {visibleColumns.department && (
                      <td className={`px-4 ${py} text-muted-foreground`}>
                        {user.department}
                      </td>
                    )}
                    {visibleColumns.tier && (
                      <td className={`px-4 ${py}`}>
                        <span className="text-[11px] font-medium text-foreground">{user.tier}</span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className={`px-4 ${py}`}>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 capitalize ${
                            user.status === 'active'
                              ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                              : user.status === 'suspended'
                              ? 'border-destructive/30 text-destructive bg-destructive/5'
                              : 'border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20'
                          }`}
                        >
                          {user.status}
                        </Badge>
                      </td>
                    )}
                    {visibleColumns.lastActive && (
                      <td className={`px-4 ${py} text-muted-foreground text-[11px]`}>
                        {user.lastActive}
                      </td>
                    )}
                    <td className={`px-4 ${py} text-right sticky right-0 bg-background/90 backdrop-blur-xs`}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(user)}
                          className="size-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Quick Edit Drawer"
                        >
                          <Edit2Icon className="size-3.5" />
                        </Button>
                        <Access accessible={canDelete}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(user)}
                            className="size-7 p-0 text-muted-foreground hover:text-destructive"
                            title="Delete User"
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </Access>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-semibold">No records match your query.</p>
                    <p className="text-xs mt-1">Try relaxing filters or resetting the search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creation Modal Dialog */}
      <ProFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Provision New Team Member"
        description="Assign enterprise role, workspace membership, and contact details."
        schema={USER_FORM_SCHEMA}
        defaultValues={{ name: '', email: '', role: 'user', department: '' }}
        submitLabel="Create User"
        onSubmit={async (values) => {
          const newUser: UserRow = {
            id: `usr_${Date.now()}`,
            name: (values.name as string) || 'New User',
            email: (values.email as string) || 'user@acme.corp',
            role: (values.role as any) || 'user',
            department: (values.department as string) || 'General',
            status: 'active',
            tier: 'Enterprise',
            lastActive: 'Just now',
          };
          setUsers((prev) => [newUser, ...prev]);
          toast.success(`User ${newUser.name} created successfully`);
          setCreateDialogOpen(false);
          return true;
        }}
      />

      {/* Edit Slide-over Drawer */}
      <ProFormDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        title={`Edit Profile: ${activeEditingUser?.name || ''}`}
        description="Update role boundaries and corporate department."
        schema={USER_FORM_SCHEMA}
        defaultValues={{
          name: activeEditingUser?.name || '',
          email: activeEditingUser?.email || '',
          role: activeEditingUser?.role || 'user',
          department: activeEditingUser?.department || '',
        }}
        submitLabel="Save Changes"
        onSubmit={async (values) => {
          if (activeEditingUser) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === activeEditingUser.id
                  ? {
                      ...u,
                      name: (values.name as string) || u.name,
                      email: (values.email as string) || u.email,
                      role: (values.role as any) || u.role,
                      department: (values.department as string) || u.department,
                    }
                  : u
              )
            );
            toast.success(`Updated ${activeEditingUser.name}`);
            setEditDrawerOpen(false);
          }
          return true;
        }}
      />

      {/* Two-Tier Destructive Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangleIcon className="size-5" />
              <DialogTitle className="text-base font-bold">Destructive Deletion Confirmation</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-2">
              You are about to permanently delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email}).
              This action will revoke active JWT sessions, SSO profiles, and platform authorizations immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-xs font-medium text-foreground">
              Please type <span className="font-bold text-destructive font-mono">DELETE</span> to confirm:
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type DELETE"
              className="text-xs font-mono"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={confirmInput !== 'DELETE'}
              onClick={confirmDestructiveDelete}
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
