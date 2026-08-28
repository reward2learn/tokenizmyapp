'use client';

import { useRef, useState, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { AdminAccessGate } from '@/components/auth/admin-access-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { BrandConfigTab } from '@/components/ops-admin/brand-config-tab';
import { NavigationManager } from '@/components/ops-admin/navigation-manager';
import { PageSectionsManager } from '@/components/ops-admin/page-sections-manager';
import { TenantInfoTab } from '@/components/ops-admin/tenant-info-tab';
import { TenantDashboard } from '@/components/ops-admin/tenant-dashboard';
import { getClientTenantConfig } from '@shared/lib/config/tenant';
import {
  useListRoleConfigsQuery,
  useListAdminConversationsQuery,
  useArchiveAdminConversationMutation,
  useListAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useCreateAdminUsersMutation,
  useListAdminGroupsQuery,
  useCreateAdminGroupMutation,
  useUpdateAdminGroupMutation,
} from '@/store/apis/admin-api';
import type { AdminUserView } from '@/app/api/admin/users/route';
import type { BatchUserInput, BatchUserResult } from '@/app/api/admin/users/batch/route';
import type { AdminGroupView } from '@/app/api/admin/groups/route';
import {
  useListTasksQuery,
  useUpdateUserTaskAssignmentMutation,
} from '@/store/apis/tasks-api';
import { FUNCTIONAL_ROLES } from '@/domain/security/functional-roles';
import { PERSONS } from '@/domain/security/persons';
import { CAPABILITY_AREAS, capability } from '@/domain/security/capabilities';
import { useAppSelector } from '@/store/hooks';

/** Roles that persist regardless of seeded data state. */
const PERSISTENT_ROLES: { code: string; name: string; isPlatformAdmin: boolean }[] = [
  { code: 'platform-admin', name: 'Platform Admin', isPlatformAdmin: true },
  { code: 'admin', name: 'Admin', isPlatformAdmin: true },
];

function RoleManager() {
  const { data, isLoading, isError } = useListRoleConfigsQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }

  // Combine persistent roles with any DB-seeded roles (after clearing, only persistent remain)
  const dbRoles = data?.data?.roles ?? [];
  const hasDbData = dbRoles.length > 0;

  // Show persistent + any additional roles from the DB
  const displayRoles = hasDbData
    ? dbRoles
    : PERSISTENT_ROLES;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Functional Role Catalog
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {hasDbData
          ? 'Roles are a display-name catalog (code + name), not tied to a person. People map to roles via the PERSONS registry; PINs are managed in the User Accounts tab.'
          : 'No seeded roles — showing persistent defaults (Platform Admin, Admin). Seed data to restore all functional roles.'}
      </Typography>
      {isError ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Could not load roles from database. Showing persistent defaults.
        </Alert>
      ) : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>PIN</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayRoles.map((r) => (
            <TableRow key={r.code}>
              <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>{r.code}</TableCell>
              <TableCell>
                {'pinConfigured' in r ? (
                  (r as { pinConfigured: boolean }).pinConfigured ? (
                    <Chip label="configured" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="not set" size="small" color="warning" variant="outlined" />
                  )
                ) : (
                  <Chip label="—" size="small" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function ConversationManager() {
  const { data, isLoading, isError, refetch } = useListAdminConversationsQuery({ limit: 100 });
  const [archive, { isLoading: isArchiving }] = useArchiveAdminConversationMutation();
  const [showArchived, setShowArchived] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }
  if (isError || !data?.success) {
    return <Alert severity="error">Failed to load conversations.</Alert>;
  }

  const conversations = (data.data.conversations ?? []).filter((c) => showArchived || !c.archived);

  const handleToggle = async (id: number, archived: boolean) => {
    await archive({ id, archived: !archived }).unwrap();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, overflow: 'hidden' }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          AI Chat Conversations
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Button size="small" variant="text" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button
            size="small"
            variant={showArchived ? 'contained' : 'outlined'}
            onClick={() => setShowArchived((prev) => !prev)}
          >
            {showArchived ? 'Hide archived' : 'Show archived'}
          </Button>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Archive a conversation to remove it from the user&apos;s saved list (last 20 non-archived are shown).
        Platform admins can archive any conversation.
      </Typography>
      {conversations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No conversations.</Typography>
      ) : (
        <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Messages</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Archive</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversations.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.user_name}{c.owner_sub ? ` (${c.owner_sub})` : ''}</TableCell>
                <TableCell>{c.message_count}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={c.archived ? 'outlined' : 'contained'}
                    color={c.archived ? 'inherit' : 'warning'}
                    disabled={isArchiving}
                    onClick={() => void handleToggle(c.id, c.archived)}
                  >
                    {c.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

function UserManager() {
  const { data, isLoading, isError, refetch } = useListAdminUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
  const { data: groupsData } = useListAdminGroupsQuery();
  // Fetch PIN config status (maps functional role code → pinConfigured).
  const { data: roleConfigData } = useListRoleConfigsQuery();
  // Task catalog (platform admin scope = all tasks) for per-user assignment.
  const { data: tasksData } = useListTasksQuery();
  const [setUserAssignment, { isLoading: isAssigning }] = useUpdateUserTaskAssignmentMutation();
  const [editing, setEditing] = useState<{
    id: string; sub: string; email: string; isActive: boolean; roleCode: string | null;
    groupCodes: string[]; pin: string;
  } | null>(null);
  const [details, setDetails] = useState<AdminUserView | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [taskEditor, setTaskEditor] = useState<AdminUserView | null>(null);
  const [taskToAdd, setTaskToAdd] = useState<string>('');
  const [createUsers, { isLoading: isCreatingUsers }] = useCreateAdminUsersMutation();
  // Onboarding state (single add + CSV batch upload).
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    name: string; email: string; roleCode: string; pin: string; isActive: boolean;
  }>({ name: '', email: '', roleCode: '', pin: '', isActive: true });
  const [batchResult, setBatchResult] = useState<{
    created: number; updated: number; skipped: number; errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const allGroups = groupsData?.data.groups ?? [];

  // Build PIN status map (functional role code → configured).
  const pinStatus: Record<string, boolean> = {};
  if (roleConfigData?.success && roleConfigData.data.roles) {
    for (const r of roleConfigData.data.roles) {
      pinStatus[r.code] = r.pinConfigured;
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }
  if (isError || !data?.success) {
    return <Alert severity="error">Failed to load users.</Alert>;
  }

  const users = data.data.users ?? [];
  const allTasks = tasksData?.success ? tasksData.data.tasks : [];
  const taskPriorityColor: Record<string, 'error' | 'warning' | 'info'> = {
    P0: 'error', P1: 'warning', P2: 'info',
  };

  const assignedTasksFor = (u: AdminUserView) => {
    const ids = new Set(u.taskIds ?? []);
    return allTasks.filter((t) => ids.has(t.id));
  };

  const unassignedTasksFor = (u: AdminUserView) => {
    const ids = new Set(u.taskIds ?? []);
    return allTasks.filter((t) => !ids.has(t.id));
  };

  const handleUserTaskAssignment = async (u: AdminUserView, taskId: string, assigned: boolean) => {
    await setUserAssignment({ taskId, userId: u.id, assigned }).unwrap();
    setTaskToAdd('');
    refetch();
  };

  // Live view of the user being edited — derived from the latest users list so
  // taskIds stay in sync after an assignment mutation + refetch.
  const editorUser = taskEditor ? (users.find((u) => u.id === taskEditor.id) ?? taskEditor) : null;

  const openEditor = (user: AdminUserView) => {
    setEditing({
      id: user.id, sub: user.sub, email: user.email ?? '',
      isActive: user.isActive, roleCode: user.roleCode,
      groupCodes: user.groups, pin: '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    await updateUser({
      id: editing.id,
      email: editing.email || undefined,
      isActive: editing.isActive,
      roleCode: editing.roleCode,
      groupCodes: editing.groupCodes,
      pin: editing.pin || undefined,
    }).unwrap();
    setEditing(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!editing) return;
    await deleteUser({ id: editing.id, sub: editing.sub }).unwrap();
    setEditing(null);
    setDeleteConfirm(null);
    refetch();
  };

  const handleAddUser = async () => {
    if (!addForm.email.trim()) return;
    const res = await createUsers({
      users: [{
        name: addForm.name.trim() || undefined,
        email: addForm.email.trim(),
        roleCode: addForm.roleCode || undefined,
        pin: addForm.pin.trim() || undefined,
        isActive: addForm.isActive,
      }],
    }).unwrap();
    setBatchResult({
      created: res.data.created,
      updated: res.data.updated,
      skipped: res.data.skipped,
      errors: res.data.results
        .filter((r) => r.status === 'skipped' && r.error)
        .map((r) => `Row ${r.row} (${r.email}): ${r.error}`),
    });
    setAddOpen(false);
    setAddForm({ name: '', email: '', roleCode: '', pin: '', isActive: true });
    refetch();
  };

  const handleDownloadTemplate = () => {
    const csv = [
      'name,email,roleCode,pin',
      'John Doe,john@example.com,operations,1234',
      'Jane Smith,jane@example.com,finance,5678',
    ].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-accounts-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Minimal CSV parser (handles quoted fields, CRLF, and BOM).
  const parseCsvRows = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    const srcTxt = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < srcTxt.length; i++) {
      const c = srcTxt[i];
      if (inQuotes) {
        if (c === '"') {
          if (srcTxt[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else field += c;
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && srcTxt[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some((f) => f.trim() !== '')) rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
    if (field !== '' || row.length > 0) {
      row.push(field);
      if (row.some((f) => f.trim() !== '')) rows.push(row);
    }
    return rows;
  };

  const handleCsvFile = async (file: File) => {
    const text = await file.text();
    const rows = parseCsvRows(text);
    if (rows.length < 2) {
      setBatchResult({
        created: 0, updated: 0, skipped: 0,
        errors: ['CSV must contain a header row and at least one data row.'],
      });
      return;
    }
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');
    const roleIdx = headers.indexOf('rolecode');
    const pinIdx = headers.indexOf('pin');
    if (emailIdx < 0) {
      setBatchResult({
        created: 0, updated: 0, skipped: 0,
        errors: ['CSV must include an "email" column (expected header: name,email,roleCode,pin).'],
      });
      return;
    }
    const users: BatchUserInput[] = [];
    const errors: string[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const email = (r[emailIdx] ?? '').trim();
      if (!email) { errors.push(`Row ${i + 1}: missing email — skipped.`); continue; }
      users.push({
        name: nameIdx >= 0 && (r[nameIdx] ?? '').trim() ? (r[nameIdx] ?? '').trim() : undefined,
        email,
        roleCode: roleIdx >= 0 && (r[roleIdx] ?? '').trim() ? (r[roleIdx] ?? '').trim() : undefined,
        pin: pinIdx >= 0 && (r[pinIdx] ?? '').trim() ? (r[pinIdx] ?? '').trim() : undefined,
      });
    }
    if (users.length === 0) {
      setBatchResult({
        created: 0, updated: 0, skipped: 0,
        errors: errors.length ? errors : ['No valid rows found in the CSV.'],
      });
      return;
    }
    const res = await createUsers({ users }).unwrap();
    setBatchResult({
      created: res.data.created,
      updated: res.data.updated,
      skipped: res.data.skipped,
      errors: [
        ...errors,
        ...res.data.results
          .filter((r) => r.status === 'skipped' && r.error)
          .map((r) => `Row ${r.row} (${r.email}): ${r.error}`),
      ],
    });
    refetch();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, overflow: 'hidden' }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          User Accounts
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Add User">
            <IconButton
              size="small"
              onClick={() => setAddOpen(true)}
              aria-label="Add User"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download CSV template">
            <IconButton
              size="small"
              onClick={handleDownloadTemplate}
              aria-label="Download CSV template"
              sx={{ border: 1, borderColor: 'primary.main', color: 'primary.main' }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload CSV">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload CSV"
              sx={{ border: 1, borderColor: 'primary.main', color: 'primary.main' }}
            >
              <UploadFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleCsvFile(f);
              e.target.value = '';
            }}
          />
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => refetch()} aria-label="Refresh" color="primary">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage user accounts: assign roles, set PINs, and configure group memberships.
      </Typography>
      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>Person</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>PIN</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => {
            const hasPin = u.roleCode ? (pinStatus[u.roleCode] ?? false) : false;
            return (
              <TableRow key={u.id}>
                <TableCell sx={{ fontWeight: 600 }}>
                  {u.name ?? u.sub}
                  {!u.isActive ? (
                    <Chip label="disabled" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
                  ) : null}
                </TableCell>
                <TableCell>{FUNCTIONAL_ROLES.find((r) => r.code === u.roleCode)?.name ?? u.roleCode ?? '—'}</TableCell>
                <TableCell>{u.email ?? '—'}</TableCell>
                <TableCell>
                  {hasPin ? (
                    <Chip label="configured" size="small" color="success" variant="outlined" />
                  ) : (
                    <Chip label="not set" size="small" color="warning" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="View groups & capabilities">
                      <IconButton size="small" onClick={() => setDetails(u)} aria-label="View details">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" variant="outlined" onClick={() => { setTaskEditor(u); setTaskToAdd(''); }}>
                      Tasks
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => openEditor(u)}>
                      Edit
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </TableContainer>

      {/* Details modal: groups + capabilities */}
      <Dialog open={Boolean(details)} onClose={() => setDetails(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{details?.name ?? details?.sub}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">
              {details?.email ?? '—'}
            </Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Security groups</Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                {details && details.groups.length ? (
                  details.groups.map((g) => (
                    <Chip key={g} label={g} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">none</Typography>
                )}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Capabilities</Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                {details && details.permissions.includes('*') ? (
                  <Chip label="all" size="small" color="primary" variant="outlined" />
                ) : details && details.permissions.length ? (
                  details.permissions.map((p) => (
                    <Chip key={p} label={p} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">none</Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Per-user task assignment modal */}
      <Dialog open={Boolean(taskEditor)} onClose={() => setTaskEditor(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Tasks — {taskEditor?.name ?? taskEditor?.sub}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Tasks assigned directly to this user appear on their Exit-Viability Tasks page with their priority.
            Role-based playbook tasks remain visible through the user&apos;s functional role.
          </Typography>
          {editorUser ? (
            <Stack spacing={1}>
              {/* Add a task — first, so assigning is immediate */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Add a task
              </Typography>
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel id="task-to-add-label">Task</InputLabel>
                  <Select
                    labelId="task-to-add-label"
                    label="Task"
                    value={taskToAdd}
                    onChange={(e) => setTaskToAdd(e.target.value)}
                  >
                    {unassignedTasksFor(editorUser).map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.priority} — {t.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  variant="contained"
                  disabled={isAssigning || !taskToAdd}
                  onClick={() => void handleUserTaskAssignment(editorUser, taskToAdd, true)}
                >
                  Assign
                </Button>
              </Stack>
              {unassignedTasksFor(editorUser).length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  All tasks are already assigned to this user.
                </Typography>
              ) : null}

              <Divider sx={{ my: 1 }} />

              {/* Assigned task list — refreshed live from the users query */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Assigned tasks ({assignedTasksFor(editorUser).length})
              </Typography>
              {assignedTasksFor(editorUser).map((t) => (
                <Stack
                  key={t.id}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Chip label={t.priority} size="small" color={taskPriorityColor[t.priority]} />
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    disabled={isAssigning}
                    onClick={() => void handleUserTaskAssignment(editorUser, t.id, false)}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
              {assignedTasksFor(editorUser).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tasks assigned to this user yet.
                </Typography>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setTaskEditor(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Manage {users.find((u) => u.id === editing?.id)?.name ?? editing?.id}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="user-status-label">Status</InputLabel>
              <Select
                labelId="user-status-label"
                label="Status"
                value={editing ? (editing.isActive ? 'active' : 'disabled') : 'active'}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, isActive: e.target.value === 'active' } : prev)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="user-role-label">Functional role</InputLabel>
              <Select
                labelId="user-role-label"
                label="Functional role"
                value={editing?.roleCode ?? ''}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, roleCode: e.target.value || null } : prev)}
              >
                <MenuItem value="">— none —</MenuItem>
                {FUNCTIONAL_ROLES.map((fr) => (
                  <MenuItem key={fr.code} value={fr.code}>{fr.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="user-groups-label">Security groups</InputLabel>
              <Select
                labelId="user-groups-label"
                label="Security groups"
                multiple
                value={editing?.groupCodes ?? []}
                onChange={(e) => setEditing((prev) => prev ? { ...prev, groupCodes: e.target.value as string[] } : prev)}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                {allGroups.map((g) => (
                  <MenuItem key={g.code} value={g.code}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Email"
              type="email"
              placeholder="user@example.com"
              value={editing?.email ?? ''}
              onChange={(e) => setEditing((prev) => prev ? { ...prev, email: e.target.value } : prev)}
            />
            <TextField
              type="password"
              size="small"
              label="Set / rotate PIN"
              placeholder="new PIN (min 3 chars)"
              value={editing?.pin ?? ''}
              onChange={(e) => setEditing((prev) => prev ? { ...prev, pin: e.target.value } : prev)}
              slotProps={{ htmlInput: { maxLength: 12 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {deleteConfirm === editing?.id ? (
            <>
              <Button size="small" color="error" variant="contained" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? 'Deleting…' : 'Confirm delete'}
              </Button>
              <Button size="small" variant="text" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            </>
          ) : (
            <>
              <Button size="small" color="error" variant="text" onClick={() => setDeleteConfirm(editing?.id ?? null)}>
                Delete
              </Button>
              <Button size="small" variant="text" onClick={() => setEditing(null)}>Cancel</Button>
              <Button size="small" variant="contained" disabled={isUpdating} onClick={() => void handleSave()}>Save</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Add user (single onboarding) dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add user</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Onboard a new user into the tenant app. They can sign in with a PIN until they
              connect a Google account.
            </Typography>
            <TextField
              size="small"
              label="Name"
              value={addForm.name}
              onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              size="small"
              label="Email"
              type="email"
              required
              placeholder="user@example.com"
              value={addForm.email}
              onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="add-user-role-label">Functional role</InputLabel>
              <Select
                labelId="add-user-role-label"
                label="Functional role"
                value={addForm.roleCode}
                onChange={(e) => setAddForm((prev) => ({ ...prev, roleCode: e.target.value }))}
              >
                <MenuItem value="">— none —</MenuItem>
                {FUNCTIONAL_ROLES.map((fr) => (
                  <MenuItem key={fr.code} value={fr.code}>{fr.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="password"
              size="small"
              label="PIN (optional)"
              placeholder="min 3 chars"
              value={addForm.pin}
              onChange={(e) => setAddForm((prev) => ({ ...prev, pin: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 12 } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={addForm.isActive}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="text" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            size="small"
            variant="contained"
            disabled={isCreatingUsers || !addForm.email.trim()}
            onClick={() => void handleAddUser()}
          >
            {isCreatingUsers ? 'Creating…' : 'Add user'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch upload result dialog */}
      <Dialog open={Boolean(batchResult)} onClose={() => setBatchResult(null)} maxWidth="sm" fullWidth>
        <DialogTitle>User onboarding result</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {batchResult ? (
              <>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
                  <Chip label={`Created: ${batchResult.created}`} size="small" color="success" variant="outlined" />
                  <Chip label={`Updated: ${batchResult.updated}`} size="small" color="info" variant="outlined" />
                  <Chip label={`Skipped: ${batchResult.skipped}`} size="small" color={batchResult.skipped > 0 ? 'warning' : 'default'} variant="outlined" />
                </Stack>
                {batchResult.errors.length ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Issues</Typography>
                    <Stack spacing={0.5}>
                      {batchResult.errors.map((e, idx) => (
                        <Typography key={idx} variant="body2" color="error">{e}</Typography>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Alert severity="success">All users processed successfully.</Alert>
                )}
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setBatchResult(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function GroupManager() {
  const { data, isLoading, isError, refetch } = useListAdminGroupsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateAdminGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateAdminGroupMutation();
  const [newGroup, setNewGroup] = useState<{ code: string; name: string; description: string }>({ code: '', name: '', description: '' });
  const [editing, setEditing] = useState<{ code: string; name: string; description: string | null; permissions: string[] } | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }
  if (isError || !data?.success) {
    return <Alert severity="error">Failed to load groups.</Alert>;
  }

  const groups = data.data.groups ?? [];

  const handleCreate = async () => {
    if (!newGroup.code.trim() || !newGroup.name.trim()) return;
    await createGroup({ code: newGroup.code.trim().toLowerCase(), name: newGroup.name.trim(), description: newGroup.description.trim() }).unwrap();
    setNewGroup({ code: '', name: '', description: '' });
    refetch();
  };

  const openEditor = (g: AdminGroupView) => {
    setEditing({ code: g.code, name: g.name, description: g.description, permissions: [...g.permissions] });
  };

  const toggleCap = (cap: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const has = prev.permissions.includes(cap);
      return {
        ...prev,
        permissions: has ? prev.permissions.filter((c) => c !== cap) : [...prev.permissions, cap],
      };
    });
  };

  const handleSavePerms = async () => {
    if (!editing) return;
    await updateGroup({ code: editing.code, permissions: editing.permissions }).unwrap();
    setEditing(null);
    refetch();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Security Groups
        </Typography>
        <Button size="small" variant="text" onClick={() => refetch()}>
          Refresh
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Groups gate API calls and routes by membership. Each group grants a set of capabilities
        (read/write per area). Platform admins are implicitly granted every capability.
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Capabilities</TableCell>
            <TableCell>System</TableCell>
            <TableCell align="right">Members</TableCell>
            <TableCell align="right">Manage</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((g) => (
            <TableRow key={g.code}>
              <TableCell sx={{ fontWeight: 600 }}>{g.code}</TableCell>
              <TableCell>{g.name}</TableCell>
              <TableCell>{g.description ?? '—'}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                  {g.permissions.includes('*') ? (
                    <Chip label="all" size="small" color="primary" variant="outlined" />
                  ) : g.permissions.length ? (
                    g.permissions.map((p) => (
                      <Chip key={p} label={p} size="small" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">none</Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>{g.isSystem ? <Chip label="system" size="small" color="info" variant="outlined" /> : null}</TableCell>
              <TableCell align="right">{g.memberCount}</TableCell>
              <TableCell align="right">
                <Button size="small" variant="outlined" disabled={g.isSystem} onClick={() => openEditor(g)}>
                  Permissions
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
        <TextField size="small" label="Code" value={newGroup.code} onChange={(e) => setNewGroup((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. marketing" />
        <TextField size="small" label="Name" value={newGroup.name} onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))} placeholder="Marketing" />
        <TextField size="small" label="Description" value={newGroup.description} onChange={(e) => setNewGroup((p) => ({ ...p, description: e.target.value }))} sx={{ flex: 1 }} />
        <Button size="small" variant="contained" disabled={isCreating || !newGroup.code.trim() || !newGroup.name.trim()} onClick={() => void handleCreate()}>
          Add group
        </Button>
      </Stack>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Capabilities — {editing?.code}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {CAPABILITY_AREAS.map((area) => (
              <Box key={area.area}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{area.label}</Typography>
                <Stack direction="row" spacing={2}>
                  {area.accesses.map((acc) => {
                    const cap = capability(area.area, acc);
                    return (
                      <FormControlLabel
                        key={cap}
                        control={
                          <Checkbox
                            checked={editing?.permissions.includes(cap) ?? false}
                            onChange={() => toggleCap(cap)}
                          />
                        }
                        label={acc === 'use' ? 'Use' : acc === 'read' ? 'Read' : 'Write'}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setEditing(null)}>Cancel</Button>
          <Button size="small" variant="contained" disabled={isUpdating} onClick={() => void handleSavePerms()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTokenizmyapp = getClientTenantConfig().slug === 'tokenizmyapp';
  const { platformAdmin, groups } = useAppSelector((s) => s.auth);
  const isFactoryPlatformAdmin = Boolean(platformAdmin) || (groups ?? []).includes('platform-admin');

  const adminTabs = useMemo(() => {
    const core = [
      'Tenant Info',
      'Navigation',
      'Page Content',
      'Brand Config',
      'Security Groups',
      'Accounts',
      'Roles',
      'AI Chat',
    ];
    if (isTokenizmyapp && isFactoryPlatformAdmin) {
      return ['Tenants', ...core];
    }
    return core;
  }, [isTokenizmyapp, isFactoryPlatformAdmin]);

  const activeTab = adminTabs[Math.min(tab, adminTabs.length - 1)] ?? adminTabs[0];

  return (
    <AdminAccessGate
      fallback={<SignInPanelGate requiredTier="pin" />}
    >
      <Box sx={{   mx: 'auto', px: 3, py: 3 }}>
        <Stack spacing={3}>
          {/* <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Platform Admin
          </Typography> */}
          {isMobile ? (
            <FormControl size="small" sx={{ minWidth: 260, position: 'sticky', top: 66, zIndex: 1000, backgroundColor: 'background.default', py: 1 }}>
              <InputLabel id="admin-section-select-label">Section</InputLabel>
              <Select
                labelId="admin-section-select-label"
                label="Section"
                value={Math.min(tab, adminTabs.length - 1)}
                onChange={(e) => setTab(Number(e.target.value))}
              >
                {adminTabs.map((label, i) => (
                  <MenuItem key={label} value={i}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Tabs
              value={Math.min(tab, adminTabs.length - 1)}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ position: 'sticky', top: 66, zIndex: 1000, backgroundColor: 'background.default', py: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              {adminTabs.map((label) => (
                <Tab key={label} label={label} />
              ))}
            </Tabs>
          )}
          {activeTab === 'Tenants' ? <TenantDashboard /> : null}
          {activeTab === 'Tenant Info' ? <TenantInfoTab /> : null}
          {activeTab === 'Navigation' ? <NavigationManager /> : null}
          {activeTab === 'Page Content' ? <PageSectionsManager /> : null}
          {activeTab === 'Brand Config' ? <BrandConfigTab /> : null}
          {activeTab === 'Security Groups' ? <GroupManager /> : null}
          {activeTab === 'Accounts' ? <UserManager /> : null}
          {activeTab === 'Roles' ? <RoleManager /> : null}
          {activeTab === 'AI Chat' ? <ConversationManager /> : null}
        </Stack>
      </Box>
    </AdminAccessGate>
  );
}
