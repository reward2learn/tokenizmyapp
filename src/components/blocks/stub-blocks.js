import { jsx as _jsx } from "react/jsx-runtime";
import dynamic from 'next/dynamic';
import { parseBlockConfig } from '@/lib/schemas/block-config';
const OpsAdminTabs = dynamic(() => import('@/components/ops-admin/ops-admin-tabs').then((m) => ({ default: m.OpsAdminTabs })), { ssr: false });
const ChatPanel = dynamic(() => import('@/components/chat/chat-panel').then((m) => ({ default: m.ChatPanel })), { ssr: false });
const ReviewBlocks = dynamic(() => import('@/components/review/review-blocks').then((m) => ({ default: m.ReviewBlocks })), { ssr: false });
export function OpsAdminTabsBlock({ config }) {
    parseBlockConfig('ops_admin_tabs', config);
    return _jsx(OpsAdminTabs, {});
}
export function ZReportFormBlock({ config }) {
    parseBlockConfig('z_report_form', config);
    return _jsx(OpsAdminTabs, { initialTab: "day-pos" });
}
export function CostsFormBlock({ config }) {
    parseBlockConfig('costs_form', config);
    return _jsx(OpsAdminTabs, { initialTab: "costs-payroll" });
}
export function CalendarImportBlock({ config }) {
    parseBlockConfig('calendar_import', config);
    return _jsx(OpsAdminTabs, { initialTab: "fill-missing" });
}
export function ChatPanelBlock({ config }) {
    parseBlockConfig('chat_panel', config);
    return _jsx(ChatPanel, {});
}
export function ReviewBlocksBlock({ config }) {
    parseBlockConfig('review_blocks', config);
    return _jsx(ReviewBlocks, {});
}
