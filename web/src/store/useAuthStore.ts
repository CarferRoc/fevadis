import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import type { Profile } from '../types';

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;

    isAdmin: boolean;
    isEditor: boolean;
    isAdminOrEditor: boolean;

    setSession: (session: Session | null) => void;
    fetchProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isAdmin: false,
    isEditor: false,
    isAdminOrEditor: false,

    setSession: (session) => {
        set({
            session,
            user: session?.user ?? null,
            isLoading: false,
        });
        if (session?.user) {
            get().fetchProfile();
        } else {
            set({ profile: null, isAdmin: false, isEditor: false, isAdminOrEditor: false });
        }
    },

    fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            const profile = data as Profile;
            set({
                profile,
                isAdmin: profile.role === 'admin',
                isEditor: profile.role === 'editor',
                isAdminOrEditor: profile.role === 'admin' || profile.role === 'editor',
            });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({
            session: null,
            user: null,
            profile: null,
            isAdmin: false,
            isEditor: false,
            isAdminOrEditor: false,
        });
    },
}));
