import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
    if (value === undefined) return fallback;
    return value === 'true' || value === '1';
};

const parsePort = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;

    const port = Number.parseInt(value, 10);
    return Number.isFinite(port) ? port : fallback;
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const host = env.VITE_HOST || '127.0.0.1';

    return {
        base: './',
        publicDir: false,
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            host,
            port: parsePort(env.VITE_PORT, 5173),
            strictPort: true,
            open: parseBoolean(env.VITE_OPEN),
        },
        preview: {
            host,
            port: parsePort(env.VITE_PREVIEW_PORT, 4173),
            strictPort: true,
            open: parseBoolean(env.VITE_PREVIEW_OPEN),
        },
        build: {
            modulePreload: false,
            outDir: '../webroot',
            emptyOutDir: true,
            assetsDir: 'assets',
            target: 'es2022',
            sourcemap: parseBoolean(env.VITE_SOURCEMAP),
            reportCompressedSize: false,
            rolldownOptions: {
                output: {
                    entryFileNames: 'assets/[name]-[hash].js',
                    chunkFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash][extname]',
                },
            },
        },
    };
});
