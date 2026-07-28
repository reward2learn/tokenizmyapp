import { jsx as _jsx } from "react/jsx-runtime";
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { TasksView } from '@/components/tasks/tasks-view';
export default function TasksPage() {
    return (_jsx(AuthGate, { requiredTier: "google", fallback: _jsx(SignInPanelGate, { requiredTier: "google" }), children: _jsx(TasksView, {}) }));
}
