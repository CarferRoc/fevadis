import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { activitiesService } from '../../services/activitiesService';
import { AdminHeader } from '../../components/AdminHeader';
import { ActivityForm } from './AdminActivityFormShared';
import { theme } from '../../theme';

export function AdminEditActivityPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: activity, isLoading } = useQuery({
        queryKey: ['activity', id],
        queryFn: () => activitiesService.getActivityById(id!),
        enabled: !!id,
    });

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Editar Actividad" back />
            {isLoading || !activity ? (
                <div style={{ padding: 24, textAlign: 'center', color: theme.colors.textSecondary }}>Cargando…</div>
            ) : (
                <ActivityForm
                    initial={{
                        titulo: activity.titulo,
                        descripcion: activity.descripcion ?? '',
                        categoria: activity.categoria,
                        ubicacion: activity.ubicacion ?? '',
                        plazas: String(activity.plazas),
                        fechaInicio: new Date(activity.fecha_inicio),
                        fechaFin: new Date(activity.fecha_fin),
                    }}
                    submitTitle="Guardar cambios"
                    onSubmit={async (v) => {
                        try {
                            await activitiesService.updateActivity(id!, {
                                titulo: v.titulo.trim(),
                                descripcion: v.descripcion.trim() || null,
                                categoria: v.categoria,
                                ubicacion: v.ubicacion.trim() || null,
                                plazas: parseInt(v.plazas),
                                fecha_inicio: v.fechaInicio.toISOString(),
                                fecha_fin: v.fechaFin.toISOString(),
                            });
                            toast.success('Guardado');
                            navigate(-1);
                        } catch (e: any) {
                            toast.error('Error', { description: e.message });
                        }
                    }}
                />
            )}
        </div>
    );
}
