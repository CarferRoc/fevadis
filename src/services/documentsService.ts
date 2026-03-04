import { supabase } from '../utils/supabase';

export const documentsService = {
    async getDocuments() {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async deleteDocument(id: string, path: string) {
        const { error: storageError } = await supabase.storage.from('documents').remove([path]);
        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
        if (dbError) throw dbError;
    },

    async uploadDocument(file: any, title: string, category: string) {
        // TODO: Implement upload
        throw new Error('Not implemented');
    },

    getPublicUrl(path: string) {
        return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl;
    },

    async createSignedUrl(path: string, expiresIn: number) {
        return await supabase.storage.from('documents').createSignedUrl(path, expiresIn);
    }
};
