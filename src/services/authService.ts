import { supabase } from '../utils/supabase';
import { formatDni } from '../utils/dniValidator';

/**
 * Checks if a DNI is authorized and active in the authorized_dnis table.
 * Uses a Supabase RPC function with SECURITY DEFINER to bypass RLS.
 */
export async function checkAuthorizedDni(dni: string): Promise<boolean> {
    const normalizedDni = formatDni(dni);
    const { data, error } = await supabase.rpc('check_authorized_dni', {
        p_dni: normalizedDni,
    });
    if (error) {
        console.error('checkAuthorizedDni error:', error);
        return false;
    }
    return data === true;
}

/**
 * Marks an authorized DNI as used and links it to the user.
 */
export async function useAuthorizedDni(
    dni: string,
    userId: string
): Promise<void> {
    const normalizedDni = formatDni(dni);
    const { error } = await supabase.rpc('use_authorized_dni', {
        p_dni: normalizedDni,
        p_user_id: userId,
    });
    if (error) throw new Error(error.message);
}

/**
 * Sign in using DNI + password.
 * Looks up the email from the profiles table, then calls signInWithPassword.
 */
export async function signInWithDni(
    dni: string,
    password: string
): Promise<void> {
    const normalizedDni = formatDni(dni);

    // Resolve email via SECURITY DEFINER RPC (no direct SELECT on profiles
    // so the login flow works under strict RLS with publishable/anon key).
    const { data: email, error: rpcError } = await supabase.rpc('get_email_by_dni', {
        p_dni: normalizedDni,
    });

    if (rpcError) throw new Error(rpcError.message);
    if (!email) throw new Error('No existe ningún usuario con ese DNI');

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new Error(error.message);
}

/**
 * Registers a new user.
 * 1. Verifies DNI is authorized
 * 2. Creates auth user
 * 3. Updates their profile (trigger creates it automatically)
 * 4. Marks the DNI as used
 */
export async function register(params: {
    dni: string;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
}): Promise<void> {
    const { dni, nombre, apellidos, email, password } = params;
    const normalizedDni = formatDni(dni);

    // 1. Verify DNI is authorized
    const authorized = await checkAuthorizedDni(normalizedDni);
    if (!authorized) {
        throw new Error(
            'Tu DNI no está autorizado para registrarse. Contacta con un administrador.'
        );
    }

    // 2. Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nombre,
                apellidos,
                dni: normalizedDni,
            },
        },
    });

    if (authError) {
        // Traducir errores comunes a español
        const msg = authError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
            throw new Error('Este correo electrónico ya está registrado. ¿Ya tienes cuenta?');
        }
        if (msg.includes('database error')) {
            throw new Error(
                'Error al crear el usuario. Es posible que el DNI ya esté en uso. Contacta con un administrador.'
            );
        }
        throw new Error(authError.message);
    }
    if (!data.user) throw new Error('No se pudo crear el usuario');

    // 3. Upsert profile – ensures the row exists even if the trigger failed silently
    await new Promise(resolve => setTimeout(resolve, 800));

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
            {
                user_id: data.user.id,
                nombre,
                apellidos,
                email,
                dni: normalizedDni,
            },
            { onConflict: 'user_id' }
        );

    if (profileError && profileError.code !== 'PGRST204') {
        console.error('Profile upsert error:', profileError);
        // If upsert fails too, try a plain update as fallback
        await supabase
            .from('profiles')
            .update({ nombre, apellidos, email, dni: normalizedDni })
            .eq('user_id', data.user.id);
    }

    // 4. Mark DNI as used (requires profile to exist due to FK constraint)
    await useAuthorizedDni(normalizedDni, data.user.id);
}
