export interface PickedFile {
    file: File;
    name: string;
    size: number;
    type: string;
}

/**
 * Abre un selector de archivos nativo del navegador y devuelve el archivo
 * elegido (o null si se cancela).
 */
export function pickFile(accept = '*/*'): Promise<PickedFile | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.style.display = 'none';

        let resolved = false;
        const finish = (value: PickedFile | null) => {
            if (resolved) return;
            resolved = true;
            try { document.body.removeChild(input); } catch {}
            resolve(value);
        };

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return finish(null);
            finish({
                file,
                name: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
            });
        };

        // Si el usuario cierra sin elegir, onchange no dispara.
        // Detectamos con focus un ligero delay.
        const onFocus = () => {
            setTimeout(() => {
                if (!resolved) finish(null);
            }, 800);
            window.removeEventListener('focus', onFocus);
        };
        window.addEventListener('focus', onFocus);

        document.body.appendChild(input);
        input.click();
    });
}
