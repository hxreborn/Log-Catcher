const LOG_DIR = '/sdcard/Download';
const MODULE_VERSION = 'v2.1-dev';

const generateFakeEntries = (count: number): string => {
    const now = Date.now();
    const lines: string[] = [];
    for (let i = 0; i < count; i++) {
        const age = i * (3 + Math.random() * 20) * 3600_000;
        const d = new Date(now - age);
        const pad = (n: number, w = 2) => String(n).padStart(w, '0');
        const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        const size = 800 + Math.floor(Math.random() * 120_000);
        lines.push(`${size} ${LOG_DIR}/bootlog-${ts}.tar.gz`);
    }
    return lines.join('\n');
};

const FAKE_FILES = generateFakeEntries(6);

const respond = (cmd: string): [number, string, string] => {
    if (cmd.startsWith('stat -c')) return [0, FAKE_FILES, ''];
    if (cmd.startsWith('grep "^version="')) return [0, MODULE_VERSION, ''];
    if (cmd.startsWith('rm ')) return [0, '', ''];
    if (cmd.startsWith('am start')) return [0, '', ''];
    if (cmd.includes('ksud module config')) return [0, '', ''];
    if (cmd.includes('/data/local/logcatcher')) return [0, '', ''];
    return [1, '', `mock: unhandled command: ${cmd}`];
};

export const installMockBridge = (): void => {
    if (globalThis.ksu) return;

    globalThis.ksu = {
        exec(cmd: string, _options: string, callbackName: string) {
            const [errno, stdout, stderr] = respond(cmd);
            setTimeout(
                () => {
                    const cb = window[callbackName as `_ksu_cb_${string}`];
                    if (cb) cb(errno, stdout, stderr);
                },
                80 + Math.random() * 200,
            );
        },
        toast(msg: string) {
            console.log(`[KSU toast] ${msg}`);
        },
    };

    console.log('[dev-mock] KSU bridge installed');
};

const KSU_COLORS_LIGHT = `
    --primary: #0061a4;
    --onPrimary: #ffffff;
    --primaryContainer: #d1e4ff;
    --onPrimaryContainer: #001d36;
    --secondary: #535f70;
    --onSecondary: #ffffff;
    --secondaryContainer: #d7e3f7;
    --onSecondaryContainer: #101c2b;
    --tertiary: #6b5778;
    --onTertiary: #ffffff;
    --tertiaryContainer: #f2daff;
    --onTertiaryContainer: #251431;
    --error: #ba1a1a;
    --onError: #ffffff;
    --errorContainer: #ffdad6;
    --onErrorContainer: #410002;
    --background: #fdfcff;
    --onBackground: #1a1c1e;
    --surface: #fdfcff;
    --onSurface: #1a1c1e;
    --surfaceVariant: #dfe2eb;
    --onSurfaceVariant: #43474e;
    --outline: #73777f;
    --outlineVariant: #c3c7cf;
    --surfaceContainerHigh: #e6e5e9;
    --surfaceContainer: #ecebed;
    --surfaceContainerLow: #f3f2f4;
    --inverseSurface: #2f3033;
    --inverseOnSurface: #f1f0f4;
    --inversePrimary: #9ecaff;
`;

const KSU_COLORS_DARK = `
    --primary: #9ecaff;
    --onPrimary: #003258;
    --primaryContainer: #00497d;
    --onPrimaryContainer: #d1e4ff;
    --secondary: #bbc7db;
    --onSecondary: #253140;
    --secondaryContainer: #3b4858;
    --onSecondaryContainer: #d7e3f7;
    --tertiary: #d6bee4;
    --onTertiary: #3b2948;
    --tertiaryContainer: #523f5f;
    --onTertiaryContainer: #f2daff;
    --error: #ffb4ab;
    --onError: #690005;
    --errorContainer: #93000a;
    --onErrorContainer: #ffdad6;
    --background: #1a1c1e;
    --onBackground: #e2e2e6;
    --surface: #1a1c1e;
    --onSurface: #e2e2e6;
    --surfaceVariant: #43474e;
    --onSurfaceVariant: #c3c7cf;
    --outline: #8d9199;
    --outlineVariant: #43474e;
    --surfaceContainerHigh: #303134;
    --surfaceContainer: #282a2d;
    --surfaceContainerLow: #1f2022;
    --inverseSurface: #e2e2e6;
    --inverseOnSurface: #1a1c1e;
    --inversePrimary: #0061a4;
`;

export const installMockColors = (): void => {
    if (getComputedStyle(document.documentElement).getPropertyValue('--onPrimary').trim()) return;

    const style = document.createElement('style');
    style.textContent = `
        :root { ${KSU_COLORS_DARK} }
        @media (prefers-color-scheme: light) { :root { ${KSU_COLORS_LIGHT} } }
    `;
    document.head.append(style);
    console.log('[dev-mock] Material You colors injected (blue 500 theme)');
};
