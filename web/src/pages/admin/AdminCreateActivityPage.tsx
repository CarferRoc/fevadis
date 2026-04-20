import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { activitiesService } from '../../services/activitiesService';
import { AdminHeader } from '../../components/AdminHeader';
import { ActivityForm } from './AdminActivityFormShared';
import { theme } from '../../theme';

export function AdminCreateActivityPage() {
    const navigate = useNavigate();

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Nueva Actividad" back />
            <ActivityForm
                submitTitle="Crear actividad"
                onSubmit={async (v) => {
                    try {
                        await activitiesService.createActivity({
                            titulo: v.titulo.trim(),
                            descripcion: v.descripcion.trim() || null,
                            categoria: v.categoria,
                            ubicacion: v.ubicacion.trim() || null,
                            plazas: parseInt(v.plazas),
                            fecha_inicio: v.fechaInicio.toISOString(),
                            fecha_fin: v.fechaFin.toISOString(),
                        });
                        toast.success('Actividad creada');
                        navigate(-1);
                    } catch (e: any) {
                        toast.error('Error', { description: e.message });
                    }
                }}
            />
        </div>
    );
}
