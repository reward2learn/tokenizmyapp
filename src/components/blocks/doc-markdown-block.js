'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { MarkdownBody } from '@/components/blocks/markdown-body';
import { useGetDocumentQuery } from '@/store/apis/content-api';
export function DocMarkdownBlock({ config, initialMarkdown }) {
    const { source, title } = parseBlockConfig('doc_markdown', config);
    const { data, isLoading, isError } = useGetDocumentQuery(source, {
        skip: !!initialMarkdown,
    });
    const body = initialMarkdown ?? data?.markdown ?? '';
    return (_jsx(Box, { component: "section", sx: { mx: 'auto', px: 3, py: 5 }, children: _jsxs(Paper, { elevation: 0, sx: {
                p: { xs: 3, md: 6 },
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255,255,255,0.03)',
                lineHeight: 1.8,
            }, children: [title ? (_jsx(Typography, { variant: "h4", component: "h1", sx: {
                        fontWeight: 800,
                        mb: 2,
                        pb: 1.25,
                        borderBottom: '2px solid rgba(235, 61, 40, 0.3)',
                    }, children: title })) : null, isLoading && !initialMarkdown ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 28 }) })) : isError ? (_jsx(Typography, { variant: "body1", color: "text.secondary", children: "Document content unavailable." })) : !body ? (_jsx(Typography, { variant: "body1", color: "text.secondary", sx: { textAlign: 'center', py: 4 }, children: "No content available. Seed the database or generate content via the AI Content Generation tab." })) : (_jsx(MarkdownBody, { markdown: body }))] }) }));
}
