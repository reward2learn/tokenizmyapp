import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
/** Lightweight markdown renderer — headings, lists, paragraphs, bold, links. */
export function MarkdownBody({ markdown }) {
    const blocks = markdown.split(/\n\n+/);
    return (_jsx(Box, { sx: {
            '& h1, & h2, & h3': { fontWeight: 700, mt: 2, mb: 1 },
            '& h1': { fontSize: '1.75rem' },
            '& h2': { fontSize: '1.35rem' },
            '& h3': { fontSize: '1.1rem' },
            '& p': { mb: 1.5, color: 'text.secondary' },
            '& ul': { pl: 3, mb: 1.5, color: 'text.secondary' },
            '& li': { mb: 0.5 },
            '& a': { color: 'primary.main' },
            '& code': {
                fontFamily: 'monospace',
                fontSize: '0.9em',
                bgcolor: 'rgba(255,255,255,0.06)',
                px: 0.5,
                borderRadius: 0.5,
            },
            '& .md-table-scroll': {
                display: 'block',
                width: '100%',
                overflowX: 'auto',
                mb: 2,
                WebkitOverflowScrolling: 'touch',
            },
            '& table': { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
            '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                px: 1,
                py: 0.75,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
            },
            '& th': { fontWeight: 600 },
        }, children: blocks.map((block, index) => renderBlock(block, index)) }));
}
function renderInline(text) {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
    let last = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) {
            parts.push(text.slice(last, match.index));
        }
        const token = match[0];
        if (token.startsWith('**')) {
            parts.push(_jsx("strong", { children: token.slice(2, -2) }, key++));
        }
        else if (token.startsWith('`')) {
            parts.push(_jsx("code", { children: token.slice(1, -1) }, key++));
        }
        else {
            const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
                parts.push(_jsx("a", { href: linkMatch[2], target: "_blank", rel: "noopener noreferrer", children: linkMatch[1] }, key++));
            }
        }
        last = match.index + token.length;
    }
    if (last < text.length) {
        parts.push(text.slice(last));
    }
    return parts.length ? parts : [text];
}
function renderBlock(block, index) {
    const trimmed = block.trim();
    if (!trimmed)
        return null;
    if (trimmed.startsWith('# ')) {
        return (_jsx(Typography, { variant: "h4", component: "h1", children: renderInline(trimmed.slice(2)) }, index));
    }
    if (trimmed.startsWith('## ')) {
        return (_jsx(Typography, { variant: "h5", component: "h2", children: renderInline(trimmed.slice(3)) }, index));
    }
    if (trimmed.startsWith('### ')) {
        return (_jsx(Typography, { variant: "h6", component: "h3", children: renderInline(trimmed.slice(4)) }, index));
    }
    if (trimmed.startsWith('|')) {
        const rows = trimmed.split('\n').filter((r) => r.trim() && !/^\|[-\s|]+\|$/.test(r.trim()));
        if (rows.length) {
            const [head, ...body] = rows;
            const headCells = head.split('|').filter(Boolean).map((c) => c.trim());
            return (_jsx(Box, { className: "md-table-scroll", children: _jsxs(Box, { component: "table", children: [_jsx("thead", { children: _jsx("tr", { children: headCells.map((cell, i) => (_jsx("th", { children: renderInline(cell) }, i))) }) }), _jsx("tbody", { children: body.map((row, ri) => {
                                const cells = row.split('|').filter(Boolean).map((c) => c.trim());
                                return (_jsx("tr", { children: cells.map((cell, ci) => (_jsx("td", { children: renderInline(cell) }, ci))) }, ri));
                            }) })] }) }, index));
        }
    }
    const lines = trimmed.split('\n');
    if (lines.every((l) => l.startsWith('- ') || l.startsWith('* ') || /^- \[[ x]\]/.test(l))) {
        return (_jsx(Box, { component: "ul", children: lines.map((line, li) => {
                const checked = /^- \[x\]/.test(line);
                const unchecked = /^- \[ \]/.test(line);
                const text = line
                    .replace(/^[-*] /, '')
                    .replace(/^- \[[ x]\] /, '');
                return (_jsxs(Box, { component: "li", children: [checked ? '☑ ' : unchecked ? '☐ ' : null, renderInline(text)] }, li));
            }) }, index));
    }
    return (_jsx(Typography, { variant: "body1", component: "p", children: renderInline(trimmed.replace(/\n/g, ' ')) }, index));
}
