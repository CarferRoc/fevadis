import { supabase } from '../utils/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export interface UserDocument {
    id: string;
    user_id: string;
    filename: string;
    storage_path: string;
    file_size: number | null;
    created_at: string;
}

export interface Certificate {
    id: string;
    registration_id: string;
    activity_id: string;
    user_id: string;
    storage_path: string;
    filename: string;
    uploaded_by: string | null;
    created_at: string;
    profile?: { nombre: string; apellidos: string; dni: string; email: string };
    activity?: { titulo: string };
}

export const documentService = {
    // ─── Documentos de usuario ──────────────────────────────────

    async pickAndUploadDocument(userId: string): Promise<UserDocument> {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets?.[0]) {
            throw new Error('No se seleccionó ningún archivo');
        }

        const asset = result.assets[0];
        const filename = asset.name;
        const storagePath = `${userId}/${Date.now()}_${filename}`;

        // Lee el archivo como base64
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: 'base64' as any,
        });

        // ArrayBuffer desde base64
        const byteCharacters = atob(base64);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
        }

        const { error: uploadError } = await supabase.storage
            .from('user-documents')
            .upload(storagePath, byteArray, {
                contentType: asset.mimeType ?? 'application/octet-stream',
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data, error } = await supabase
            .from('user_documents')
            .insert({
                user_id: userId,
                filename,
                storage_path: storagePath,
                file_size: asset.size ?? null,
            })
            .select()
            .single();

        if (error) throw error;
        return data as UserDocument;
    },

    async getUserDocuments(userId: string): Promise<UserDocument[]> {
        const { data, error } = await supabase
            .from('user_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as UserDocument[];
    },

    async getDocumentDownloadUrl(storagePath: string): Promise<string> {
        const { data, error } = await supabase.storage
            .from('user-documents')
            .createSignedUrl(storagePath, 3600); // 1h

        if (error) throw error;
        return data.signedUrl;
    },

    async deleteUserDocument(doc: UserDocument): Promise<void> {
        await supabase.storage.from('user-documents').remove([doc.storage_path]);
        const { error } = await supabase.from('user_documents').delete().eq('id', doc.id);
        if (error) throw error;
    },

    // ─── Certificados de asistencia ─────────────────────────────

    async pickAndUploadCertificate(
        registrationId: string,
        activityId: string,
        userId: string,
        uploadedBy: string
    ): Promise<Certificate> {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets?.[0]) {
            throw new Error('No se seleccionó ningún archivo');
        }

        const asset = result.assets[0];
        const filename = asset.name;
        const storagePath = `${activityId}/${userId}_${Date.now()}_${filename}`;

        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: 'base64' as any,
        });

        const byteCharacters = atob(base64);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
        }

        const { error: uploadError } = await supabase.storage
            .from('certificates')
            .upload(storagePath, byteArray, {
                contentType: asset.mimeType ?? 'application/pdf',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data, error } = await supabase
            .from('certificates')
            .insert({
                registration_id: registrationId,
                activity_id: activityId,
                user_id: userId,
                storage_path: storagePath,
                filename,
                uploaded_by: uploadedBy,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Certificate;
    },

    async getCertificatesByActivity(): Promise<{ activity: { id: string; titulo: string }; count: number }[]> {
        const { data, error } = await supabase
            .from('certificates')
            .select('activity_id, activity:activities!certificates_activity_id_fkey(id, titulo)');

        if (error) throw error;

        // Agrupar por actividad
        const map = new Map<string, { activity: { id: string; titulo: string }; count: number }>();
        (data ?? []).forEach((row: any) => {
            const act = row.activity;
            if (!act) return;
            if (map.has(act.id)) {
                map.get(act.id)!.count++;
            } else {
                map.set(act.id, { activity: act, count: 1 });
            }
        });

        return Array.from(map.values());
    },

    async getCertificatesForActivity(activityId: string): Promise<Certificate[]> {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                profile:profiles!certificates_user_id_fkey(nombre, apellidos, dni, email),
                activity:activities!certificates_activity_id_fkey(titulo)
            `)
            .eq('activity_id', activityId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Certificate[];
    },

    async getUserCertificates(userId: string): Promise<Certificate[]> {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                activity:activities!certificates_activity_id_fkey(titulo)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Certificate[];
    },

    async getCertificateDownloadUrl(storagePath: string): Promise<string> {
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(storagePath, 3600);

        if (error) throw error;
        return data.signedUrl;
    },
};
