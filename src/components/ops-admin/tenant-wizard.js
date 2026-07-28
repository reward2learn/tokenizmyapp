'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PaletteIcon from '@mui/icons-material/Palette';
import { getTemplate, listTemplates, isSlugAvailable, } from '@/domain/tenant/template-catalog';
import { useCreateTenantMutation, } from '@/store/apis/tenant-api';
const STEPS = ['Business Info', 'Template', 'AI Description', 'Branding', 'Review'];
const INITIAL_STATE = {
    slug: '',
    displayName: '',
    template: 'default',
    prompt: '',
    primaryColor: '#eb3d28',
    secondaryColor: '#0af9fe',
    logoBase64: null,
    scrapeUrl: '',
};
export const PIPELINE_STEPS = [
    { label: 'AI Schema Generation', key: 'schema' },
    { label: 'Neon Database Branch', key: 'neon' },
    { label: 'Database Migrations', key: 'migrations' },
    { label: 'Seeding Defaults', key: 'seed' },
    { label: 'Code Generation', key: 'codegen' },
    { label: 'Vercel Deployment', key: 'deploy' },
];
export function TenantWizard() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [state, setState] = useState(INITIAL_STATE);
    const [slugError, setSlugError] = useState(null);
    const [scraped, setScraped] = useState(null);
    const [scraping, setScraping] = useState(false);
    const [scrapeError, setScrapeError] = useState(null);
    const [createTenant, { isLoading, isError, error, isSuccess, data }] = useCreateTenantMutation();
    const handleOpen = () => { setOpen(true); setStep(0); setState(INITIAL_STATE); setScraped(null); setScrapeError(null); };
    const handleClose = () => { if (!isLoading) {
        setOpen(false);
        setStep(0);
    } };
    const update = useCallback((patch) => {
        setState((prev) => {
            const next = { ...prev, ...patch };
            if (patch.template && !patch.primaryColor) {
                const tpl = getTemplate(patch.template);
                next.primaryColor = tpl.defaultColors.primary;
                next.secondaryColor = tpl.defaultColors.secondary;
            }
            return next;
        });
    }, []);
    const validateSlug = (slug) => {
        if (!slug)
            return 'Business name is required';
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
            return 'Use lowercase letters, numbers, and hyphens only';
        if (slug.length < 2)
            return 'Must be at least 2 characters';
        if (!isSlugAvailable(slug))
            return 'This name is reserved or unavailable';
        return null;
    };
    // ── AI Scrape Handler ──────────────────────────────────
    const handleScrape = async () => {
        if (!state.scrapeUrl.trim())
            return;
        setScraping(true);
        setScrapeError(null);
        try {
            const res = await fetch('/api/admin/tenants/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: state.scrapeUrl.trim() }),
            });
            const result = await res.json();
            if (result.success && result.data) {
                const s = result.data.scraped;
                const scrapedData = {
                    businessName: s.businessName || '',
                    description: s.description || '',
                    logoBase64: s.logoBase64 || null,
                    brandColors: s.brandColors || { primary: null, secondary: null, allColors: [] },
                    images: s.images || [],
                    socialLinks: s.socialLinks || {},
                    address: s.address || null,
                    emails: s.emails || [],
                    phoneNumbers: s.phoneNumbers || [],
                    textContent: s.textContent || '',
                };
                setScraped(scrapedData);
                // Auto-fill fields from scraped data
                const updates = {};
                // Auto-fill display name
                if (scrapedData.businessName && !state.displayName) {
                    updates.displayName = scrapedData.businessName;
                }
                // Auto-fill slug from business name
                if (scrapedData.businessName && !state.slug) {
                    const autoSlug = scrapedData.businessName
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .slice(0, 30);
                    if (autoSlug && isSlugAvailable(autoSlug)) {
                        updates.slug = autoSlug;
                    }
                }
                // Auto-fill logo
                if (scrapedData.logoBase64) {
                    updates.logoBase64 = scrapedData.logoBase64;
                }
                // Auto-fill brand colors
                if (scrapedData.brandColors.primary) {
                    updates.primaryColor = scrapedData.brandColors.primary;
                }
                if (scrapedData.brandColors.secondary) {
                    updates.secondaryColor = scrapedData.brandColors.secondary;
                }
                // Auto-fill prompt
                if (result.data.generatedPrompt) {
                    updates.prompt = result.data.generatedPrompt;
                }
                // Auto-select template
                if (result.data.recommendedTemplate) {
                    const tpl = getTemplate(result.data.recommendedTemplate);
                    updates.template = tpl.id;
                    if (!scrapedData.brandColors.primary) {
                        updates.primaryColor = tpl.defaultColors.primary;
                        updates.secondaryColor = tpl.defaultColors.secondary;
                    }
                }
                if (Object.keys(updates).length > 0) {
                    setState((prev) => ({ ...prev, ...updates }));
                }
            }
            else {
                setScrapeError(result.error || 'Scraping failed');
            }
        }
        catch (err) {
            setScrapeError(err instanceof Error ? err.message : 'Unknown error');
        }
        setScraping(false);
    };
    const handleNext = () => {
        if (step === 0) {
            const err = validateSlug(state.slug);
            if (err) {
                setSlugError(err);
                return;
            }
            if (!state.displayName.trim()) {
                setSlugError('Display name is required');
                return;
            }
            setSlugError(null);
        }
        setStep((s) => s + 1);
    };
    const handleBack = () => setStep((s) => s - 1);
    const handleCreate = async () => {
        const result = await createTenant({
            slug: state.slug,
            displayName: state.displayName.trim(),
            template: state.template,
            primaryColor: state.primaryColor,
            secondaryColor: state.secondaryColor,
            prompt: state.prompt.trim() || undefined,
        }).unwrap();
        if (result.success) {
            setStep(5);
        }
    };
    const templates = listTemplates();
    const selectedTemplate = getTemplate(state.template);
    const generateDefaultPrompt = () => {
        const tpl = selectedTemplate;
        const name = state.displayName || 'my business';
        const prompts = {
            'financial-analytics': `I run ${name}, a financial analytics business. We track revenue, costs, EBITDA, and KPIs. We need P&L projections, business review reports, and daily Z-report entry.`,
            'restaurant': `I run ${name}, a restaurant. We have a menu with categories (appetizers, mains, desserts, beverages). We take table reservations, track daily covers, and integrate with GoFood for delivery.`,
            'hotel': `I run ${name}, a hotel with multiple room types. We manage bookings, track occupancy and RevPAR, have event spaces for weddings and conferences, and offer F&B services.`,
            'ecommerce-retail': `I run ${name}, an online store. We sell products across categories, manage inventory with SKUs, process sales orders, and track customer data.`,
            'healthcare': `I run ${name}, a healthcare facility. We manage patient records, clinical documents, insurance claims, and medical device telemetry data.`,
            'supply-chain': `I run ${name}, a logistics company. We track shipments, manage warehouse inventory, coordinate with carriers, and generate freight manifests.`,
            'real-estate': `I run ${name}, a real estate agency. We manage property listings, track leases, manage tenants, and handle maintenance requests.`,
            'education': `I run ${name}, an educational institution. We manage courses, student enrollments, assignments, grades, and track student progress.`,
            'professional-services': `I run ${name}, a professional services firm. We manage projects, track time entries, generate invoices, and track client deliverables.`,
            'manufacturing': `I run ${name}, a manufacturing company. We manage production orders, bill of materials, quality checks, and track inventory lots.`,
            'default': `I run ${name}. We need a business operations dashboard with financial overview, task management, and AI chat.`,
        };
        return prompts[tpl.id] ?? prompts['default'];
    };
    return (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: "Create a new tenant application with AI-powered scraping, schema generation, and deployment", children: _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: handleOpen, sx: { fontWeight: 600 }, children: "New Tenant" }) }), _jsxs(Dialog, { open: open, onClose: handleClose, maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { sx: { fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(AutoFixHighIcon, { color: "primary" }), "New Tenant App \u2014 AI-Powered Generation"] }), _jsxs(DialogContent, { dividers: true, children: [_jsx(Stepper, { activeStep: step, sx: { mb: 4 }, children: STEPS.map((label) => (_jsx(Step, { children: _jsx(StepLabel, { children: label }) }, label))) }), step === 0 ? (_jsxs(Stack, { spacing: 3, children: [_jsx(Paper, { variant: "outlined", sx: { p: 2.5, borderColor: 'primary.main', borderWidth: 1 }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Stack, { direction: "row", sx: { gap: 1, alignItems: "center" }, children: [_jsx(TravelExploreIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: "AI Assist \u2014 Scrape Existing Business" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Enter your business website URL or Instagram profile. The AI will extract your business name, logo, brand colors, and description automatically." }), _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 1, children: [_jsx(TextField, { placeholder: "https://mybusiness.com or instagram.com/mybusiness", value: state.scrapeUrl, onChange: (e) => setState((p) => ({ ...p, scrapeUrl: e.target.value })), fullWidth: true, size: "small", helperText: "Website URL or social media link" }), _jsx(Button, { variant: "contained", color: "secondary", onClick: () => void handleScrape(), disabled: scraping || !state.scrapeUrl.trim(), startIcon: scraping ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(TravelExploreIcon, {}), sx: { whiteSpace: 'nowrap', minWidth: 140 }, children: scraping ? 'Scraping...' : 'AI Scrape' })] }), scrapeError ? (_jsx(Alert, { severity: "warning", onClose: () => setScrapeError(null), children: scrapeError })) : null, scraped ? (_jsx(Paper, { variant: "outlined", sx: { p: 2, bgcolor: 'background.default' }, children: _jsxs(Stack, { direction: "row", sx: { gap: 2, alignItems: "center" }, children: [scraped.logoBase64 ? (_jsx(Avatar, { src: scraped.logoBase64, sx: { width: 56, height: 56 } })) : (_jsx(Box, { sx: { width: 56, height: 56, borderRadius: '50%', bgcolor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { variant: "caption", children: "No logo" }) })), _jsxs(Stack, { spacing: 0.5, children: [_jsxs(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: ["\u2705 ", scraped.businessName || 'Business found'] }), scraped.brandColors.primary ? (_jsxs(Stack, { direction: "row", sx: { gap: 0.5 }, children: [_jsx(Chip, { label: scraped.brandColors.primary, size: "small", sx: { bgcolor: scraped.brandColors.primary, color: '#fff' } }), scraped.brandColors.secondary ? (_jsx(Chip, { label: scraped.brandColors.secondary, size: "small", sx: { bgcolor: scraped.brandColors.secondary, color: '#000' } })) : null] })) : null, scraped.socialLinks.instagram ? (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["Instagram: ", scraped.socialLinks.instagram] })) : null] })] }) })) : null] }) }), _jsx(Divider, { children: _jsx(Typography, { variant: "caption", color: "text.secondary", children: "or enter manually" }) }), _jsx(TextField, { label: "Business Slug", placeholder: "my-business-name", value: state.slug, onChange: (e) => {
                                            const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                            setState((p) => ({ ...p, slug: v }));
                                            if (slugError)
                                                setSlugError(null);
                                        }, error: Boolean(slugError), helperText: slugError ?? 'Lowercase letters, numbers, and hyphens. This becomes your subdomain.', fullWidth: true, autoFocus: true, slotProps: {
                                            input: {
                                                startAdornment: _jsx(Typography, { variant: "body2", color: "text.disabled", sx: { mr: 0.5 }, children: "https://" }),
                                                endAdornment: _jsx(Typography, { variant: "body2", color: "text.disabled", children: ".vercel.app" }),
                                            },
                                        } }), _jsx(TextField, { label: "Display Name", placeholder: "My Business Name", value: state.displayName, onChange: (e) => setState((p) => ({ ...p, displayName: e.target.value })), fullWidth: true, helperText: "Human-readable name shown in the header and page titles." })] })) : null, step === 1 ? (_jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Select a template that matches your business type. Each template includes pre-configured pages, navigation, W3C schema alignment, and schema.org structured data." }), scraped ? (_jsxs(Alert, { severity: "info", icon: _jsx(AutoFixHighIcon, {}), children: ["AI analyzed your website and recommends: ", _jsx("strong", { children: getTemplate(selectedTemplate.id).label })] })) : null, _jsx(Grid, { container: true, spacing: 2, children: templates.map((tpl) => {
                                            const selected = state.template === tpl.id;
                                            return (_jsx(Grid, { size: { xs: 12, sm: 6 }, children: _jsx(Card, { variant: "outlined", sx: {
                                                        borderColor: selected ? 'primary.main' : 'divider',
                                                        borderWidth: selected ? 2 : 1,
                                                        bgcolor: selected ? 'rgba(235,61,40,0.06)' : undefined,
                                                    }, children: _jsx(CardActionArea, { onClick: () => update({ template: tpl.id }), children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", sx: { gap: 0 }, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: tpl.label }), selected ? _jsx(CheckCircleIcon, { color: "primary", fontSize: "small" }) : null] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: tpl.description }), _jsxs(Stack, { direction: "row", sx: { gap: 0.5, flexWrap: "wrap" }, children: [_jsx(Chip, { label: tpl.schemaOrgType, size: "small", variant: "outlined", color: "info" }), _jsx(Chip, { label: tpl.xsdStandard, size: "small", variant: "outlined" })] }), _jsxs(Stack, { direction: "row", sx: { gap: 0.5, flexWrap: "wrap" }, children: [tpl.defaultPages.slice(0, 4).map((p) => (_jsx(Chip, { label: p.title, size: "small", variant: "outlined" }, p.slug))), tpl.defaultPages.length > 4 ? (_jsx(Chip, { label: `+${tpl.defaultPages.length - 4} more`, size: "small", variant: "outlined" })) : null] })] }) }) }) }, tpl.id));
                                        }) })] })) : null, step === 2 ? (_jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Describe your business in natural language. The AI will generate a complete W3C-aligned schema (models, use cases, pages) based on your description and the selected template." }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "\uD83D\uDCA1 The more detail you provide, the better the AI can tailor the schema to your needs." })] }), scraped ? (_jsx(Alert, { severity: "success", icon: _jsx(CheckCircleIcon, {}), children: "AI pre-filled this description from your website. Review and edit as needed." })) : null, _jsx(TextField, { label: "Business Description (for AI Schema Generation)", placeholder: "e.g., I run a restaurant in Bali with 20 tables, serving Indonesian and international cuisine...", value: state.prompt, onChange: (e) => setState((p) => ({ ...p, prompt: e.target.value })), fullWidth: true, multiline: true, rows: 6, helperText: "This prompt is sent to the AI (via Vercel AI SDK) to generate your custom schema." }), _jsx(Box, { children: _jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(AutoFixHighIcon, {}), onClick: () => update({ prompt: generateDefaultPrompt() }), children: "Generate Default Prompt" }) }), state.prompt ? (_jsxs(Paper, { variant: "outlined", sx: { p: 2, bgcolor: 'background.default' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1, display: 'block' }, children: "AI will generate:" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(Typography, { variant: "body2", children: "\uD83E\uDDE0 Custom ZenStack models with schema.org mappings" }), _jsx(Typography, { variant: "body2", children: "\uD83D\uDCCB Use cases with appropriate auth tiers" }), _jsx(Typography, { variant: "body2", children: "\uD83D\uDCC4 Pages with template-specific blocks" }), _jsx(Typography, { variant: "body2", children: "\uD83D\uDDC4\uFE0F Neon database branch with migrations" }), _jsx(Typography, { variant: "body2", children: "\uD83D\uDE80 Vercel deployment with generated code" })] })] })) : null] })) : null, step === 3 ? (_jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Customize the brand colors for your application. These are used for buttons, links, and accents." }), state.logoBase64 ? (_jsx(Paper, { variant: "outlined", sx: { p: 2, borderColor: 'primary.main' }, children: _jsxs(Stack, { direction: "row", sx: { gap: 2, alignItems: "center" }, children: [_jsx(Avatar, { src: state.logoBase64, sx: { width: 64, height: 64 }, variant: "rounded" }), _jsxs(Stack, { spacing: 0.5, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: "\u2705 Logo extracted from website" }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "This logo will be used in the tenant app header" })] })] }) })) : null, scraped && scraped.brandColors.allColors.length > 0 ? (_jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsxs(Stack, { direction: "row", sx: { gap: 1, alignItems: "center" }, children: [_jsx(PaletteIcon, { color: "primary", fontSize: "small" }), _jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: "AI-Extracted Brand Colors" })] }), _jsx(Stack, { direction: "row", sx: { gap: 1, flexWrap: "wrap" }, children: scraped.brandColors.allColors.slice(0, 8).map((color) => (_jsx(Tooltip, { title: color, children: _jsx(Box, { onClick: () => update({ primaryColor: color }), sx: {
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 1,
                                                            bgcolor: color,
                                                            border: state.primaryColor === color ? '3px solid' : '1px solid',
                                                            borderColor: state.primaryColor === color ? 'primary.main' : 'divider',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            '&:hover': { transform: 'scale(1.1)' },
                                                        } }) }, color))) }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 1, display: 'block' }, children: "Click a color to set as primary. AI extracted these from your website CSS." })] })) : null, _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, children: [_jsxs(Box, { sx: { flex: 1 }, children: [_jsx(TextField, { label: "Primary Color", value: state.primaryColor, onChange: (e) => setState((p) => ({ ...p, primaryColor: e.target.value })), fullWidth: true, helperText: "Used for buttons, links, and highlights", slotProps: {
                                                            input: {
                                                                startAdornment: (_jsx(Box, { sx: { width: 24, height: 24, borderRadius: 1, bgcolor: state.primaryColor, border: '1px solid', borderColor: 'divider', mr: 1 } })),
                                                            },
                                                        } }), _jsx(Box, { sx: { mt: 0.5 }, children: _jsx("input", { type: "color", value: state.primaryColor, onChange: (e) => setState((p) => ({ ...p, primaryColor: e.target.value })), style: { width: '100%', height: 32, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, background: 'none', cursor: 'pointer' } }) })] }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(TextField, { label: "Secondary Color", value: state.secondaryColor, onChange: (e) => setState((p) => ({ ...p, secondaryColor: e.target.value })), fullWidth: true, helperText: "Used for accents and secondary elements", slotProps: {
                                                            input: {
                                                                startAdornment: (_jsx(Box, { sx: { width: 24, height: 24, borderRadius: 1, bgcolor: state.secondaryColor, border: '1px solid', borderColor: 'divider', mr: 1 } })),
                                                            },
                                                        } }), _jsx(Box, { sx: { mt: 0.5 }, children: _jsx("input", { type: "color", value: state.secondaryColor, onChange: (e) => setState((p) => ({ ...p, secondaryColor: e.target.value })), style: { width: '100%', height: 32, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, background: 'none', cursor: 'pointer' } }) })] })] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2.5, bgcolor: 'background.default' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1.5, display: 'block' }, children: "Preview" }), _jsxs(Stack, { direction: "row", sx: { gap: 1.5 }, children: [state.logoBase64 ? (_jsx(Avatar, { src: state.logoBase64, sx: { width: 32, height: 32 }, variant: "rounded" })) : null, _jsx(Box, { sx: { px: 2, py: 1, borderRadius: 1, bgcolor: state.primaryColor, color: '#fff', fontSize: '0.8rem', fontWeight: 700 }, children: "Primary Button" }), _jsx(Box, { sx: { px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: state.secondaryColor, color: state.secondaryColor, fontSize: '0.8rem', fontWeight: 700 }, children: "Secondary" }), _jsx(Box, { sx: { width: 16, height: 16, borderRadius: '50%', bgcolor: state.primaryColor } }), _jsx(Box, { sx: { width: 16, height: 16, borderRadius: '50%', bgcolor: state.secondaryColor } })] })] })] })) : null, step === 4 ? (_jsxs(Stack, { spacing: 2, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Review your tenant configuration before creating. The AI pipeline will run automatically." }), _jsx(Paper, { variant: "outlined", sx: { p: 2.5 }, children: _jsxs(Stack, { spacing: 1.5, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Slug" }), _jsxs(Typography, { variant: "body1", sx: { fontWeight: 600 }, children: [state.slug, ".vercel.app"] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Display Name" }), _jsx(Typography, { variant: "body1", sx: { fontWeight: 600 }, children: state.displayName })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Template" }), _jsxs(Typography, { variant: "body1", sx: { fontWeight: 600 }, children: [selectedTemplate.label, " \u2014 ", selectedTemplate.schemaOrgType] })] }), state.logoBase64 ? (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Logo" }), _jsx(Box, { sx: { mt: 0.5 }, children: _jsx(Avatar, { src: state.logoBase64, sx: { width: 48, height: 48 }, variant: "rounded" }) })] })) : null, state.prompt ? (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "AI Prompt" }), _jsx(Typography, { variant: "body2", sx: { mt: 0.5, fontStyle: 'italic', maxHeight: 80, overflow: 'auto' }, children: state.prompt })] })) : (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "AI Prompt" }), _jsx(Typography, { variant: "body2", color: "text.disabled", children: "Not provided \u2014 using template defaults" })] })), _jsxs(Stack, { direction: "row", sx: { gap: 1 }, children: [_jsx(Chip, { size: "small", label: `Primary: ${state.primaryColor}`, sx: { bgcolor: state.primaryColor, color: '#fff' } }), _jsx(Chip, { size: "small", label: `Secondary: ${state.secondaryColor}`, sx: { bgcolor: state.secondaryColor, color: '#000' } })] }), scraped ? (_jsxs(Box, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Scraped Data" }), _jsxs(Stack, { direction: "row", sx: { gap: 0.5, flexWrap: "wrap" }, children: [scraped.emails.length > 0 ? _jsx(Chip, { label: `📧 ${scraped.emails.length} emails`, size: "small" }) : null, scraped.phoneNumbers.length > 0 ? _jsx(Chip, { label: `📞 ${scraped.phoneNumbers.length} phones`, size: "small" }) : null, scraped.images.length > 0 ? _jsx(Chip, { label: `🖼️ ${scraped.images.length} images`, size: "small" }) : null, scraped.address ? _jsx(Chip, { label: `📍 Address found`, size: "small" }) : null, scraped.socialLinks.instagram ? _jsx(Chip, { label: "\uD83D\uDCF7 Instagram", size: "small" }) : null] })] })) : null] }) }), _jsxs(Paper, { variant: "outlined", sx: { p: 2 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mb: 1.5, display: 'block' }, children: "Pipeline (runs automatically after creation):" }), _jsx(Stack, { spacing: 0.5, children: PIPELINE_STEPS.map((ps, idx) => (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { width: 20 }, children: [idx + 1, "."] }), _jsx(Typography, { variant: "body2", children: ps.label })] }, ps.key))) })] })] })) : null, step === 5 ? (_jsxs(Stack, { spacing: 2, sx: { textAlign: 'center', py: 3 }, children: [_jsx(CheckCircleIcon, { color: "success", sx: { fontSize: 64, mx: 'auto' } }), _jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Tenant Created!" }), _jsxs(Typography, { variant: "body1", color: "text.secondary", children: [_jsx("strong", { children: state.displayName }), " has been created with the ", _jsx("strong", { children: selectedTemplate.label }), " template."] }), _jsxs(Paper, { variant: "outlined", sx: { p: 2, textAlign: 'left' }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 1.5 }, children: "Pipeline Status:" }), _jsx(Stack, { spacing: 1, children: PIPELINE_STEPS.map((ps) => (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }, children: [isLoading ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : isSuccess ? _jsx(CheckCircleIcon, { color: "success", fontSize: "small" }) : _jsx(Box, { sx: { width: 16, height: 16, borderRadius: '50%', border: '1px solid', borderColor: 'divider' } }), _jsx(Typography, { variant: "body2", color: isSuccess ? 'text.primary' : 'text.secondary', children: ps.label })] }, ps.key))) })] }), data?.data?.tenant ? (_jsx(Chip, { label: data.data.tenant.status === 'live' ? 'Live — Ready to use' : `Status: ${data.data.tenant.status}`, size: "small", color: data.data.tenant.status === 'live' ? 'success' : 'warning' })) : null, _jsxs(Stack, { direction: "row", sx: { gap: 1 }, children: [_jsx(Button, { variant: "outlined", onClick: () => { setStep(0); setState(INITIAL_STATE); setScraped(null); }, children: "Create Another" }), _jsx(Button, { variant: "contained", onClick: handleClose, children: "View Tenant List" }), _jsxs(Button, { variant: "contained", color: "secondary", component: "a", href: `https://${state.slug}.vercel.app`, target: "_blank", endIcon: _jsx(OpenInNewIcon, {}), children: ["Open ", state.slug, ".vercel.app"] })] })] })) : null, isError && error ? (_jsx(Alert, { severity: "error", sx: { mt: 2 }, children: 'data' in error ? error.data?.error ?? 'Creation failed' : 'Creation failed' })) : null] }), step < 5 ? (_jsxs(DialogActions, { children: [step > 0 ? _jsx(Button, { onClick: handleBack, disabled: isLoading, children: "Back" }) : _jsx(Button, { onClick: handleClose, disabled: isLoading, children: "Cancel" }), _jsx(Box, { sx: { flex: 1 } }), step < 4 ? (_jsx(Button, { variant: "contained", onClick: handleNext, children: "Continue" })) : (_jsx(Button, { variant: "contained", color: "primary", onClick: () => void handleCreate(), disabled: isLoading, startIcon: isLoading ? _jsx(CircularProgress, { size: 18, color: "inherit" }) : _jsx(AutoFixHighIcon, {}), children: isLoading ? 'Generating...' : 'Create with AI' }))] })) : null] })] }));
}
/**
 * Reusable MUI v9 TemplateSelector with cards, preview delta (pages/nav/colors),
 * color pickers. Used in TenantWizard and TenantDashboard for edit/deploy.
 * WCAG compliant, keyboard accessible via CardActionArea.
 */
export function TemplateSelector({ selectedId, onSelect, currentId, primaryColor, secondaryColor, onColorsChange, showPreviewDelta = false, }) {
    const templates = listTemplates();
    const selected = getTemplate(selectedId);
    const current = currentId ? getTemplate(currentId) : null;
    const hasDelta = showPreviewDelta && current && current.id !== selected.id;
    const handleColorChange = (type, value) => {
        if (onColorsChange) {
            const p = type === 'primary' ? value : (primaryColor ?? selected.defaultColors.primary);
            const s = type === 'secondary' ? value : (secondaryColor ?? selected.defaultColors.secondary);
            onColorsChange(p, s);
        }
    };
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Template Selector" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Cards show business-specific templates with schema.org alignment. Select to preview delta in pages, nav, and colors." })] }), _jsx(Grid, { container: true, spacing: 2, children: templates.map((tpl) => {
                    const isSelected = selectedId === tpl.id;
                    const isCurrent = currentId === tpl.id;
                    return (_jsx(Grid, { size: { xs: 12, sm: 6, md: 4 }, children: _jsx(Card, { variant: "outlined", sx: {
                                height: '100%',
                                borderColor: isSelected
                                    ? 'primary.main'
                                    : isCurrent
                                        ? 'success.main'
                                        : 'divider',
                                borderWidth: isSelected || isCurrent ? 2 : 1,
                                bgcolor: isSelected ? 'rgba(235,61,40,0.06)' : undefined,
                                '&:hover': { boxShadow: 3 },
                            }, children: _jsx(CardActionArea, { onClick: () => onSelect(tpl.id), sx: { height: '100%', p: 0.5 }, children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", sx: { justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }, children: [_jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 700 }, children: tpl.label }), isSelected && _jsx(CheckCircleIcon, { color: "primary", fontSize: "small" }), isCurrent && !isSelected && (_jsx(Chip, { label: "CURRENT", size: "small", color: "success" }))] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2, minHeight: 48 }, children: tpl.description.length > 90
                                                ? `${tpl.description.substring(0, 87)}...`
                                                : tpl.description }), _jsxs(Stack, { direction: "row", sx: { gap: 0.5, flexWrap: 'wrap' }, children: [_jsx(Chip, { label: Array.isArray(tpl.schemaOrgType) ? tpl.schemaOrgType[0] : tpl.schemaOrgType, size: "small", variant: "outlined", color: "info" }), _jsx(Chip, { label: `${tpl.defaultPages.length}p`, size: "small", variant: "outlined" }), _jsx(Chip, { label: tpl.xsdStandard.split(',')[0], size: "small", variant: "outlined" })] })] }) }) }) }, tpl.id));
                }) }), _jsxs(Paper, { variant: "outlined", sx: { p: 3, bgcolor: 'background.default' }, children: [_jsxs(Stack, { direction: "row", sx: { alignItems: 'center', justifyContent: 'space-between', mb: 2 }, children: [_jsxs(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: ["Live Preview \u2014 ", selected.label] }), hasDelta && (_jsx(Chip, { label: "TEMPLATE CHANGE \u2014 DELTA DETECTED", color: "warning", size: "small" }))] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1.5 }, children: "THEME COLORS (updates uiSlice theme on save if applicable)" }), _jsxs(Stack, { direction: "row", sx: { gap: 4 }, children: [_jsxs(Stack, { spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", children: "Primary" }), _jsx(Box, { sx: {
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 2,
                                                    bgcolor: primaryColor || selected.defaultColors.primary,
                                                    border: '3px solid',
                                                    borderColor: 'background.paper',
                                                    boxShadow: 2,
                                                } }), onColorsChange && (_jsxs(_Fragment, { children: [_jsx("input", { type: "color", value: primaryColor || selected.defaultColors.primary, onChange: (e) => handleColorChange('primary', e.target.value), style: {
                                                            width: '80px',
                                                            height: '32px',
                                                            padding: 0,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                        } }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace', fontSize: '0.7rem' }, children: primaryColor || selected.defaultColors.primary })] }))] }), _jsxs(Stack, { spacing: 1, sx: { alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", children: "Secondary" }), _jsx(Box, { sx: {
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 2,
                                                    bgcolor: secondaryColor || selected.defaultColors.secondary,
                                                    border: '3px solid',
                                                    borderColor: 'background.paper',
                                                    boxShadow: 2,
                                                } }), onColorsChange && (_jsxs(_Fragment, { children: [_jsx("input", { type: "color", value: secondaryColor || selected.defaultColors.secondary, onChange: (e) => handleColorChange('secondary', e.target.value), style: {
                                                            width: '80px',
                                                            height: '32px',
                                                            padding: 0,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                        } }), _jsx(Typography, { variant: "caption", sx: { fontFamily: 'monospace', fontSize: '0.7rem' }, children: secondaryColor || selected.defaultColors.secondary })] }))] })] })] }), _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }, children: ["DEFAULT PAGES (", selected.defaultPages.length, ")"] }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, children: selected.defaultPages.map((p) => (_jsx(Chip, { label: p.title, size: "small", variant: "outlined" }, p.slug))) }), hasDelta && current && (_jsxs(Alert, { severity: "info", sx: { mt: 1 }, children: ["Delta: Replacing ", current.defaultPages.length, " pages with ", selected.defaultPages.length, " new ones (including financial-analytics compatibility for RedRubyBali)."] }))] }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "caption", sx: { fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }, children: ["NAVIGATION (", selected.defaultNavItems.length, ")"] }), _jsxs(Stack, { direction: "row", spacing: 0.5, sx: { flexWrap: 'wrap' }, children: [selected.defaultNavItems.slice(0, 6).map((item, index) => (_jsx(Chip, { label: item.title, size: "small", variant: "outlined", color: "secondary" }, index))), selected.defaultNavItems.length > 6 && (_jsx(Chip, { label: `+${selected.defaultNavItems.length - 6}`, size: "small" }))] }), hasDelta && current && (_jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 1 }, children: ["Nav delta: ", selected.defaultNavItems.length - current.defaultNavItems.length, " items"] }))] })] })] })] }));
}
