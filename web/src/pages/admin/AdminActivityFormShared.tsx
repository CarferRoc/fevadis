import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import type { ActivityCategory } from '../../types';

const CATEGORIES: ActivityCategory[] = ['Ocio', 'Campamentos', 'Formaciones', 'Talleres'];

export interface ActivityFormValues {
    titulo: string;
    descripcion: string;
    categoria: ActivityCategory;
    ubicacion: string;
    plazas: string;
    fechaInicio: Date;
    fechaFin: Date;
}

interface ActivityFormProps {
    initial?: Partial<ActivityFormValues>;
    onSubmit: (v: ActivityFormValues) => Promise<void>;
    submitTitle: string;
}

function toDatetimeLocal(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ActivityForm({ initial, onSubmit, submitTitle }: ActivityFormProps) {
    const [loading, setLoading] = useState(false);
    const [titulo, setTitulo] = useState(initial?.titulo ?? '');
    const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '');
    const [categoria, setCategoria] = useState<ActivityCategory>(initial?.categoria ?? 'Ocio');
    const [ubicacion, setUbicacion] = useState(initial?.ubicacion ?? '');
    const [plazas, setPlazas] = useState(initial?.plazas ?? '');
    const [fechaInicio, setFechaInicio] = useState<Date>(initial?.fechaInicio ?? new Date());
    const [fechaFin, setFechaFin] = useState<Date>(initial?.fechaFin ?? (() => {
        const d = new Date();
        d.setHours(d.getHours() + 2);
        return d;
    })());

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!titulo.trim() || !plazas) {
            toast.error('Error', { description: 'El título y las plazas son obligatorios.' });
            return;
        }
        if (isNaN(parseInt(plazas)) || parseInt(plazas) < 1) {
            toast.error('Error', { description: 'Las plazas deben ser un número mayor a 0.' });
            return;
        }
        if (fechaFin <= fechaInicio) {
            toast.error('Error', { description: 'La fecha de fin debe ser posterior a la de inicio.' });
            return;
        }
        setLoading(true);
        try {
            await onSubmit({ titulo, descripcion, categoria, ubicacion, plazas, fechaInicio, fechaFin });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: 16, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: theme.colors.background }}>
            <FormInput label="Título *" placeholder="Nombre de la actividad" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, marginLeft: 2 }}>Categoría</label>
                <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as ActivityCategory)}
                    style={{
                        padding: '10px 12px',
                        fontSize: 14,
                        borderRadius: theme.radius.md,
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        outline: 'none',
                        minHeight: 42,
                    }}
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <FormInput
                label="Descripción"
                placeholder="Descripción de la actividad"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                multiline
                numberOfLines={4}
            />
            <FormInput label="Ubicación" placeholder="Dirección o nombre del lugar" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
            <FormInput label="Plazas *" placeholder="Ej: 20" value={plazas} onChange={(e) => setPlazas(e.target.value.replace(/\D/g, ''))} type="text" inputMode="numeric" />

            <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, marginLeft: 2, display: 'block', marginBottom: 6 }}>
                    Fecha inicio
                </label>
                <input
                    type="datetime-local"
                    value={toDatetimeLocal(fechaInicio)}
                    onChange={(e) => setFechaInicio(new Date(e.target.value))}
                    style={dateInputStyle}
                />
                <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, marginLeft: 2 }}>
                    {format(fechaInicio, "d MMM yyyy, HH:mm", { locale: es })}
                </div>
            </div>

            <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, marginLeft: 2, display: 'block', marginBottom: 6 }}>
                    Fecha fin
                </label>
                <input
                    type="datetime-local"
                    value={toDatetimeLocal(fechaFin)}
                    onChange={(e) => setFechaFin(new Date(e.target.value))}
                    style={dateInputStyle}
                />
                <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, marginLeft: 2 }}>
                    {format(fechaFin, "d MMM yyyy, HH:mm", { locale: es })}
                </div>
            </div>

            <Button title={submitTitle} type="submit" loading={loading} size="lg" fullWidth style={{ marginTop: 8 }} />
        </form>
    );
}

const dateInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    outline: 'none',
    minHeight: 42,
    fontFamily: 'inherit',
};
