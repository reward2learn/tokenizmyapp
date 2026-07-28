'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { useSaveZReportMutation } from '@/store/apis/metrics-api';
export function ZReportForm() {
    const [saveZReport, { isLoading, isSuccess, isError, error }] = useSaveZReportMutation();
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        defaultValues: {
            department: 'all_pos',
            report_date: new Date().toISOString().slice(0, 10),
        },
    });
    const onSubmit = async (values) => {
        await saveZReport({ ...values }).unwrap();
        reset(values);
    };
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), "data-testid": "z-report-form", children: [_jsx("label", { htmlFor: "report_date", children: "Report date" }), _jsx("input", { id: "report_date", type: "date", ...register('report_date', { required: 'Report date is required' }), style: { colorScheme: 'dark' } }), errors.report_date && _jsx("p", { role: "alert", children: errors.report_date.message }), _jsx("label", { htmlFor: "department", children: "Department" }), _jsx("select", { id: "department", ...register('department'), children: _jsx("option", { value: "all_pos", children: "All POS" }) }), _jsx("label", { htmlFor: "nett_sales", children: "Nett sales (IDR)" }), _jsx("input", { id: "nett_sales", type: "number", ...register('nett_sales', { valueAsNumber: true }) }), _jsx("label", { htmlFor: "total_covers", children: "Total covers" }), _jsx("input", { id: "total_covers", type: "number", ...register('total_covers', { valueAsNumber: true }) }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? 'Saving…' : 'Save Z-report' }), isSuccess && _jsx("p", { role: "status", children: "Saved successfully." }), isError && (_jsx("p", { role: "alert", children: error && 'data' in error
                    ? String(error.data?.error ?? 'Save failed')
                    : 'Save failed' }))] }));
}
