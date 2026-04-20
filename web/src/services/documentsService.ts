import { supabase } from '../utils/supabase';
import { pickFile } from '../utils/filePicker';
import type { InfoDocument } from '../types';

const BUCKET = 'documents';

export const documentsService = {
    async getDocuments(): Promise<InfoDocument[]> {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data ?? []) as InfoDocument[];
    },

    async getCategories(): Promise<string[]> {
        const { data, error } = await supabase.from('documents').select('category');
        if (error) throw error;
        const set = new Set<string>();
        (data ?? []).forEach((row: any) => {
            if (row.category) set.add(row.category);
        });
        return Array.from(set).sort();
    },

    async deleteDocument(doc: InfoDocument) {
        if (doc.url) {
            const { error: storageError } = await supabase.storage.from(BUCKET).remove([doc.url]);
            if (storageError && !storageError.message.toLowerCase().includes('not found')) {
                throw storageError;
            }
        }
        const { error: dbError } = await supabase.from('documents').delete().eq('id', doc.id);
        if (dbError) throw dbError;
    },

    async pickAndUploadInfoDocument(title: string, category: string): Promise<InfoDocument> {
        const picked = await pickFile('*/*');
        if (!picked) throw new Error('No se seleccionó ningún archivo');

        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) throw userErr ?? new Error('No session');

        const safeName = picked.name.replace(/[^\w.\-]+/g, '_');
        const path = `${userData.user.id}/${Date.now()}-${safeName}`;

        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, picked.file, {
            contentType: picked.type,
            upsert: false,
        });
        if (upErr) throw upErr;

        const { data, error: dbErr } = await supabase
            .from('documents')
            .insert({
                title: title.trim() || picked.name,
                category: category.trim() || 'General',
                url: path,
                file_type: picked.type || null,
                file_size: picked.size ?? null,
                uploaded_by: userData.user.id,
            })
            .select()
            .single();

        if (dbErr) {
            await supabase.storage.from(BUCKET).remove([path]);
            throw dbErr;
        }
        return data as InfoDocument;
    },

    async getDownloadUrl(path: string): Promise<string> {
        const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
        if (error) throw error;
        return data.signedUrl;
    },
};
