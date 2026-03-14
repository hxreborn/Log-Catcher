import { exec } from './lib/kernelsu';

export interface Settings {
    exportPath: string;
    maxLogs: number;
    pruneDays: number;
    buffers: string[];
    persistentLogging: boolean;
}

const MODULE_ID = 'hxr_logcat';
const CONFIG_DIR = '/data/local/logcatcher';
const CONFIG_FILE = `${CONFIG_DIR}/config`;
const LCS_FILE = `${CONFIG_DIR}/boot.lcs`;

export const DEFAULT_SETTINGS: Settings = {
    exportPath: '/sdcard/Download',
    maxLogs: 10,
    pruneDays: 7,
    buffers: ['main', 'system', 'crash'],
    persistentLogging: false,
};

const CONFIG_KEYS = ['export_path', 'max_logs', 'prune_days', 'buffers', 'persistent'] as const;

type ConfigKey = (typeof CONFIG_KEYS)[number];

const ksud = (subcmd: string): string => `KSU_MODULE=${MODULE_ID} ksud module config ${subcmd}`;

const intOr = (raw: string | undefined, fallback: number): number => {
    if (raw === undefined) return fallback;
    const n = Number(raw);
    return Number.isNaN(n) ? fallback : n;
};

const parseEntries = (stdout: string): Record<string, string> => {
    const entries: Record<string, string> = {};
    for (const line of stdout.split('\n')) {
        const eq = line.indexOf('=');
        if (eq > 0) entries[line.slice(0, eq)] = line.slice(eq + 1);
    }
    return entries;
};

export const loadSettings = async (): Promise<Settings> => {
    const script = CONFIG_KEYS.map(
        (k) => `v=$(${ksud(`get ${k}`)} 2>/dev/null); [ -n "$v" ] && echo "${k}=$v"`,
    ).join('; ');
    const { stdout } = await exec(script);
    const raw = parseEntries(stdout);

    return {
        exportPath: raw.export_path ?? DEFAULT_SETTINGS.exportPath,
        maxLogs: intOr(raw.max_logs, DEFAULT_SETTINGS.maxLogs),
        pruneDays: intOr(raw.prune_days, DEFAULT_SETTINGS.pruneDays),
        buffers: raw.buffers?.split(',') ?? [...DEFAULT_SETTINGS.buffers],
        persistentLogging:
            raw.persistent !== undefined
                ? raw.persistent === 'true'
                : DEFAULT_SETTINGS.persistentLogging,
    };
};

const shellQuote = (s: string): string => `'${s.replace(/'/g, "'\\''")}'`;

const writeConfigFile = async (settings: Settings): Promise<boolean> => {
    const lines = [
        `EXPORT_PATH=${settings.exportPath}`,
        `MAX_LOGS=${settings.maxLogs}`,
        `PRUNE_DAYS=${settings.pruneDays}`,
        `BUFFERS=${settings.buffers.join(',')}`,
        `PERSISTENT=${settings.persistentLogging}`,
    ].join('\n');

    const lcsCmd = settings.persistentLogging
        ? `touch ${shellQuote(LCS_FILE)}`
        : `rm -f ${shellQuote(LCS_FILE)}`;

    const cmd = `mkdir -p ${shellQuote(CONFIG_DIR)} && printf '%s\\n' ${shellQuote(lines)} > ${shellQuote(CONFIG_FILE)} && ${lcsCmd}`;
    const { errno } = await exec(cmd);
    return errno === 0;
};

const MODULE_PROP = `/data/adb/modules/${MODULE_ID}/module.prop`;

export const getModuleVersion = async (): Promise<string> => {
    const { errno, stdout } = await exec(`grep "^version=" ${MODULE_PROP} | cut -d= -f2`);
    return errno === 0 && stdout.trim() ? stdout.trim() : 'v?';
};

export const saveSettings = async (settings: Settings): Promise<boolean> => {
    const entries: [ConfigKey, string][] = [
        ['export_path', settings.exportPath],
        ['max_logs', String(settings.maxLogs)],
        ['prune_days', String(settings.pruneDays)],
        ['buffers', settings.buffers.join(',')],
        ['persistent', String(settings.persistentLogging)],
    ];

    const ksudCmd = entries.map(([key, val]) => ksud(`set ${key} ${shellQuote(val)}`)).join(' && ');

    const [ksudResult, configResult] = await Promise.all([
        exec(ksudCmd),
        writeConfigFile(settings),
    ]);

    return ksudResult.errno === 0 && configResult;
};
