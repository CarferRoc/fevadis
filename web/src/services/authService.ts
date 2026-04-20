import { supabase } from '../utils/supabase';
import { formatDni } from '../utils/dniValidator';

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

export async function useAuthorizedDni(dni: string, userId: string): Promise<void> {
    const normalizedDni = formatDni(dni);
    const { error } = await supabase.rpc('use_authorized_dni', {
        p_dni: normalizedDni,
        p_user_id: userId,
    });
    if (error) throw new Error(error.message);
}

export async function signInWithDni(dni: string, password: string): Promise<void> {
    const normalizedDni = formatDni(dni);

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

export async function register(params: {
    dni: string;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
}): Promise<void> {
    const { dni, nombre, apellidos, email, password } = params;
    const normalizedDni = formatDni(dni);

    const authorized = await checkAuthorizedDni(normalizedDni);
    if (!authorized) {
        throw new Error(
            'Tu DNI no está autorizado para registrarse. Contacta con un administrador.'
        );
    }

    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre, apellidos, dni: normalizedDni } },
    });

    if (authError) {
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

    await new Promise((resolve) => setTimeout(resolve, 800));

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
            { user_id: data.user.id, nombre, apellidos, email, dni: normalizedDni },
            { onConflict: 'user_id' }
        );

    if (profileError && profileError.code !== 'PGRST204') {
        console.error('Profile upsert error:', profileError);
        await supabase
            .from('profiles')
            .update({ nombre, apellidos, email, dni: normalizedDni })
            .eq('user_id', data.user.id);
    }

    await useAuthorizedDni(normalizedDni, data.user.id);
}
