import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rewardsService } from '../../services/rewardsService';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminRewardFormPage() {
    const navigate = useNavigate();
    const { rewardId } = useParams<{ rewardId?: string }>();
    const qc = useQueryClient();
    const { user } = useAuthStore();
    const isEditing = !!rewardId;

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [costoPuntos, setCostoPuntos] = useState('0');
    const [stock, setStock] = useState('');

    const { data: existing } = useQuery({
        queryKey: ['reward', rewardId],
        queryFn: async () => {
            const all = await rewardsService.getAllRewards();
            return all.find((r) => r.id === rewardId);
        },
        enabled: isEditing,
    });

    useEffect(() => {
        if (existing) {
            setTitulo(existing.titulo);
            setDescripcion(existing.descripcion || '');
            setCostoPuntos(existing.costo_puntos.toString());
            setStock(existing.stock !== null && existing.stock !== undefined ? existing.stock.toString() : '');
        }
    }, [existing]);

    const mutation = useMutation({
        mutationFn: async () => {
            const data = {
                titulo,
                descripcion,
                costo_puntos: parseInt(costoPuntos, 10) || 0,
                stock: stock.trim() !== '' ? parseInt(stock, 10) : null,
                created_by: user?.id,
            };
            if (isEditing && rewardId) return rewardsService.updateReward(rewardId, data);
            return rewardsService.createReward(data as any);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-rewards'] });
            toast.success(`Recompensa ${isEditing ? 'actualizada' : 'creada'}`);
            navigate(-1);
        },
        onError: (error: any) => toast.error('Error', { description: error.message || 'Error al guardar la recompensa' }),
    });

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!titulo.trim()) {
            toast.error('Error', { description: 'El título es obligatorio' });
            return;
        }
        mutation.mutate();
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title={isEditing ? 'Editar Recompensa' : 'Nueva Recompensa'} back />

            <form onSubmit={handleSave} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text, marginBottom: 6 }}>
                    {isEditing ? 'Editar Recompensa' : 'Nueva Recompensa'}
                </div>

                <FormInput label="Título *" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Camiseta Oficial FEVADIS" />
                <FormInput label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} multiline maxLength={500} />
                <FormInput label="Costo en Puntos *" value={costoPuntos} onChange={(e) => setCostoPuntos(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="0" />
                <FormInput label="Stock (vacío para ilimitado)" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Ej: 50" />

                <Button title={isEditing ? 'Guardar Cambios' : 'Crear Recompensa'} type="submit" loading={mutation.isPending} fullWidth style={{ marginTop: 8 }} />
            </form>
        </div>
    );
}
