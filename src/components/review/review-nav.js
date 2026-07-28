'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { getReviewPartDisplayTitle, listReviewParts, setDynamicReviewParts, tierAllowsAccess, } from '@/lib/page-catalog';
import { useAppSelector } from '@/store/hooks';
import { useGetSeedDetailsQuery } from '@/store/apis/config-api';
import { useEffect, useMemo, useState } from 'react';
const TOUCH_TARGET = { minHeight: 48 };
const PART_SELECT_LABEL = 'Jump between review sections';
export function ReviewNav({ currentSlug }) {
    const router = useRouter();
    const tier = useAppSelector((s) => s.auth.tier);
    // Track catalog version so async-loaded DB parts trigger a re-render
    const [catalogVersion, setCatalogVersion] = useState(0);
    const { data: seedData } = useGetSeedDetailsQuery();
    // On mount, fetch all review parts from the DB and register in the catalog
    useEffect(() => {
        if (!seedData)
            return;
        const details = seedData.data?.reviewPartDetails;
        if (details?.length) {
            const parts = details.map((p) => ({
                partSlug: p.slug,
                partKey: p.partKey,
                title: p.title,
                authTier: 'google',
            }));
            setDynamicReviewParts(parts);
            setCatalogVersion((v) => v + 1);
        }
    }, [seedData]);
    const parts = useMemo(() => listReviewParts().filter((part) => tierAllowsAccess(tier, part.authTier)), [catalogVersion, tier]);
    const handlePartChange = (partSlug) => {
        router.push(`/review/${partSlug}`);
    };
    return (_jsx(Box, { component: "nav", "aria-label": "Business review parts", sx: {
            width: { xs: '100%', md: 260 },
            flexShrink: 0,
            px: { xs: 3, md: 0 },
            py: { xs: 2, md: 4 },
            position: { md: 'sticky' },
            top: { md: 72 },
            alignSelf: 'flex-start',
        }, children: _jsxs(Paper, { elevation: 0, sx: {
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255,255,255,0.03)',
                overflow: 'hidden',
            }, children: [_jsxs(Box, { sx: { px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }, children: [_jsx(Typography, { variant: "overline", color: "primary.main", sx: { fontWeight: 700 }, children: "Parts A\u2013O" }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: 'block' }, children: tierAllowsAccess(tier, 'google')
                                ? PART_SELECT_LABEL
                                : 'Sign in with Google for full review access' })] }), _jsx(Box, { sx: { display: { xs: 'block', md: 'none' }, p: 2 }, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { id: "review-part-select-label", children: PART_SELECT_LABEL }), _jsx(Select, { labelId: "review-part-select-label", id: "review-part-select", value: currentSlug, label: PART_SELECT_LABEL, onChange: (event) => handlePartChange(event.target.value), inputProps: { 'aria-label': PART_SELECT_LABEL }, children: parts.map((part) => (_jsx(MenuItem, { value: part.partSlug, children: getReviewPartDisplayTitle(part.title) }, part.partSlug))) })] }) }), _jsx(List, { dense: true, disablePadding: true, sx: { display: { xs: 'none', md: 'block' } }, children: parts.map((part) => {
                        const href = `/review/${part.partSlug}`;
                        const selected = part.partSlug === currentSlug;
                        const displayTitle = getReviewPartDisplayTitle(part.title);
                        return (_jsx(ListItemButton, { component: Link, href: href, selected: selected, sx: {
                                ...TOUCH_TARGET,
                                borderLeft: '3px solid transparent',
                                '&.Mui-selected': {
                                    borderLeftColor: 'primary.main',
                                    bgcolor: 'rgba(235, 61, 40, 0.08)',
                                },
                            }, children: _jsx(Tooltip, { title: displayTitle, placement: "right", enterDelay: 500, children: _jsx(ListItemText, { primary: displayTitle, slotProps: {
                                        primary: {
                                            variant: 'body2',
                                            sx: {
                                                fontWeight: selected ? 700 : 600,
                                                whiteSpace: 'normal',
                                                lineHeight: 1.35,
                                            },
                                        },
                                    } }) }) }, part.partSlug));
                    }) })] }) }));
}
