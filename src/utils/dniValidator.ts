/**
 * Validates Spanish DNI format and check letter.
 * Format: 8 digits followed by 1 uppercase letter (e.g., 12345678Z)
 */

const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

/**
 * Validates that the DNI has the correct format (8 digits + 1 letter, uppercase).
 */
export function validateDniFormat(dni: string): boolean {
    return DNI_REGEX.test(dni.trim().toUpperCase());
}

/**
 * Validates that the check letter is correct for the given DNI.
 * Assumes format is already valid (call validateDniFormat first).
 */
export function validateDniLetter(dni: string): boolean {
    const normalized = dni.trim().toUpperCase();
    if (!validateDniFormat(normalized)) return false;
    const number = parseInt(normalized.slice(0, 8), 10);
    const letter = normalized.slice(8);
    return DNI_LETTERS[number % 23] === letter;
}

/**
 * Normalizes a DNI string to uppercase with no spaces.
 */
export function formatDni(dni: string): string {
    return dni.trim().toUpperCase();
}

/**
 * Full DNI validation: format + letter check.
 * Returns an error message string or null if valid.
 */
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
