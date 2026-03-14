declare global {
    var ksu: KsuBridge | undefined;
    interface Window {
        [key: `_ksu_cb_${string}`]: KsuCallback;
    }
}

interface KsuBridge {
    exec(cmd: string, options: string, callbackName: string): void;
    toast(msg: string): void;
}

type KsuCallback = (errno: number, stdout: string, stderr: string) => void;

export interface ExecResult {
    readonly errno: number;
    readonly stdout: string;
    readonly stderr: string;
}

let cbId = 0;

export const exec = (
    cmd: string,
    options: Record<string, unknown> = {},
    timeout = 10_000,
): Promise<ExecResult> =>
    new Promise((resolve) => {
        const callbackName = `_ksu_cb_${++cbId}` as const;
        let settled = false;

        const settle = (result: ExecResult) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            delete window[callbackName];
            resolve(result);
        };

        const timer = setTimeout(
            () => settle({ errno: 1, stdout: '', stderr: 'exec timeout' }),
            timeout,
        );

        window[callbackName] = (errno, stdout, stderr) => settle({ errno, stdout, stderr });

        if (globalThis.ksu) {
            globalThis.ksu.exec(cmd, JSON.stringify(options), callbackName);
        } else {
            settle({ errno: 1, stdout: '', stderr: 'ksu bridge not available' });
        }
    });

export const toast = (msg: string): void => {
    globalThis.ksu?.toast(msg);
};
