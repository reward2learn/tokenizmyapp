import { jsx as _jsx } from "react/jsx-runtime";
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { TasksView } from '@/components/tasks/tasks-view';
export default async function RoleTasksPage({ params }) {
    const { role } = await params;
    const roleCode = role.toUpperCase();
    return (_jsx(AuthGate, { requiredTier: "pin", fallback: _jsx(SignInPanelGate, { requiredTier: "pin" }), children: _jsx(TasksView, { forcedRole: roleCode }) }));
}
