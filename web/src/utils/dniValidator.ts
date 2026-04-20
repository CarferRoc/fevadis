const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export function validateDniFormat(dni: string): boolean {
    return DNI_REGEX.test(dni.trim().toUpperCase());
}

export function validateDniLetter(dni: string): boolean {
    const normalized = dni.trim().toUpperCase();
    if (!validateDniFormat(normalized)) return false;
    const number = parseInt(normalized.slice(0, 8), 10);
    const letter = normalized.slice(8);
    return DNI_LETTERS[number % 23] === letter;
}

export function formatDni(dni: string): string {
    return dni.trim().toUpperCase();
}

export function getDniError(raw: string): string | null {
    const dni = formatDni(raw);
    if (!validateDniFormat(dni)) {
        return 'El DNI debe tener 8 números seguidos de una letra (ej. 12345678Z)';
    }
    if (!validateDniLetter(dni)) {
        return 'La letra del DNI no es correcta';
    }
    return null;
}
