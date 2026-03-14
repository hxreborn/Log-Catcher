import { parse } from 'date-fns';
import prettyBytes from 'pretty-bytes';
import { exec } from './lib/kernelsu';

export interface LogFile {
    readonly filename: string;
    readonly basename: string;
    readonly sizeBytes: number;
    readonly sizeFormatted: string;
    readonly date: Date;
    readonly path: string;
}

let logDir = '/sdcard/Download';
export const SAFE_PATH = /^\/[a-zA-Z0-9_/.-]+$/;
const logPattern = () => `"${logDir}"/bootlog-*.tar.gz`;
const LOG_TIMESTAMP = /^bootlog-(\d{8})-(\d{6})\.tar\.gz$/;

export const setLogDir = (dir: string): void => {
    if (!SAFE_PATH.test(dir)) throw new Error(`Invalid log directory: ${dir}`);
    logDir = dir;
};

const MODULE_PROP = '/data/adb/modules/hxr_logcat/module.prop';

const parseFilenameDate = (filename: string): Date | null => {
    const match = LOG_TIMESTAMP.exec(filename);
    if (!match) return null;
    return parse(`${match[1]}-${match[2]}`, 'yyyyMMdd-HHmmss', new Date());
};

const parseStatLine = (line: string): LogFile | null => {
    const match = /^(\d+)\s+(.+)$/.exec(line);
    if (!match) return null;

    const sizeBytes = Number.parseInt(match[1], 10);
    const path = match[2];
    const filename = path.split('/').pop() ?? '';
    const date = parseFilenameDate(filename);
    if (!date) return null;

    return {
        filename,
        basename: filename.replace('.tar.gz', ''),
        sizeBytes,
        sizeFormatted: prettyBytes(sizeBytes),
        date,
        path,
    };
};

export const listFiles = async (): Promise<LogFile[]> => {
    const { errno, stdout, stderr } = await exec(`stat -c "%s %n" ${logPattern()}`);

    if (errno !== 0) {
        if (stderr.includes('No such file') || stderr.includes('cannot stat')) return [];
        throw new Error(stderr || `Exit code: ${errno}`);
    }

    if (!stdout.trim()) return [];

    return stdout
        .trim()
        .split('\n')
        .map(parseStatLine)
        .filter((f): f is LogFile => f !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const deleteFile = async (file: LogFile): Promise<boolean> => {
    if (!LOG_TIMESTAMP.test(file.filename)) throw new Error(`Invalid filename: ${file.filename}`);
    const { errno } = await exec(`rm "${logDir}/${file.filename}"`);
    return errno === 0;
};

export const deleteAll = async (currentCount: number): Promise<number> => {
    if (currentCount === 0) return 0;
    const { errno } = await exec(`rm -f ${logPattern()}`);
    return errno === 0 ? currentCount : 0;
};

const getContentUri = async (filePath: string): Promise<string | null> => {
    await exec(
        `am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file://${filePath}"`,
    );
    const { errno, stdout } = await exec(
        `content query --uri content://media/external/file --projection _id --where "_data='${filePath}'"`,
    );
    if (errno !== 0 || !stdout.trim()) return null;
    const idMatch = /Row: \d+ _id=(\d+)/.exec(stdout);
    return idMatch ? `content://media/external/file/${idMatch[1]}` : null;
};

export const shareFiles = async (files: readonly LogFile[]): Promise<boolean> => {
    if (files.length === 0) return false;

    const uris: string[] = [];
    for (const f of files) {
        const uri = await getContentUri(f.path);
        if (!uri) return false;
        uris.push(uri);
    }

    let cmd: string;
    if (uris.length === 1) {
        cmd = `am start -a android.intent.action.SEND -t "application/gzip" --eu android.intent.extra.STREAM "${uris[0]}"`;
    } else {
        cmd = `am start -a android.intent.action.SEND_MULTIPLE -t "application/gzip" --esal android.intent.extra.STREAM "${uris.join(',')}"`;
    }

    const { errno } = await exec(cmd);
    return errno === 0;
};

export const getModuleVersion = async (): Promise<string> => {
    const { errno, stdout } = await exec(`grep "^version=" ${MODULE_PROP} | cut -d= -f2`);
    return errno === 0 && stdout.trim() ? stdout.trim() : 'v?';
};
