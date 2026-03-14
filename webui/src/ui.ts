import { format } from 'date-fns';
import type { MdDialog } from '@material/web/dialog/dialog.js';
import type { LogFile } from './files';

export const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const escapeHtml = (str: string): string => str.replaceAll(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

const html = (strings: TemplateStringsArray, ...values: unknown[]): string =>
    strings.reduce(
        (result, str, i) => result + str + (i < values.length ? escapeHtml(String(values[i])) : ''),
        '',
    );

export const showRefreshProgress = (): void => {
    $('refresh-progress').hidden = false;
};

export const hideRefreshProgress = (): void => {
    $('refresh-progress').hidden = true;
};

export const showFiles = (files: ReadonlyArray<LogFile>): void => {
    $('file-list').hidden = false;
    $('archives-header').hidden = false;
    $('empty-state').hidden = true;

    $('file-list').innerHTML = files
        .map(
            (file, i) => html`
                <li class="file-item" data-index="${i}">
                    <label>
                        <md-checkbox></md-checkbox>
                        <div class="file-info">
                            <span class="file-name">${file.filename}</span>
                            <span class="file-meta">${file.sizeFormatted} · ${format(file.date, 'MMM d, HH:mm')}</span>
                        </div>
                    </label>
                </li>`,
        )
        .join('');
};

export const showEmpty = (): void => {
    $('file-list').hidden = true;
    $('archives-header').hidden = true;
    $('empty-state').hidden = false;
    $('selection-bar').hidden = true;
};

export const updateFileCount = (total: number): void => {
    $('file-count').textContent = `${total} file${total !== 1 ? 's' : ''}`;
};

export const updateSelectionBar = (count: number): void => {
    $('selection-bar').hidden = count === 0;
    if (count > 0) {
        $('selection-count').textContent = `${count} selected`;
    }
};

export const showConfirm = (title: string, message: string): Promise<boolean> =>
    new Promise((resolve) => {
        const dialog = $<MdDialog>('confirm-dialog');
        $('dialog-title').textContent = title;
        $('dialog-message').textContent = message;

        const ac = new AbortController();
        const done = (confirmed: boolean) => {
            if (ac.signal.aborted) return;
            ac.abort();
            if (dialog.open) dialog.close();
            resolve(confirmed);
        };

        $('dialog-cancel').addEventListener('click', () => done(false), { signal: ac.signal });
        $('dialog-confirm').addEventListener('click', () => done(true), { signal: ac.signal });
        dialog.addEventListener('closed', () => done(false), { signal: ac.signal });
        dialog.show();
    });

export const showHelp = (): void => {
    const dialog = $<MdDialog>('help-dialog');
    $('help-close').onclick = () => dialog.close();
    dialog.show();
};

export const setupSectionHelp = (): void => {
    for (const btn of document.querySelectorAll<HTMLElement>('.section-help-btn')) {
        const dialogId = `${btn.dataset.help}-help`;
        const dialog = $<MdDialog>(dialogId);
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dialog.show();
        });
    }
    for (const btn of document.querySelectorAll<HTMLElement>('.help-dialog-close')) {
        btn.addEventListener('click', () => {
            (btn.closest('md-dialog') as MdDialog).close();
        });
    }
};

export const setVersion = (version: string): void => {
    $('version').textContent = version;
    $('help-version').textContent = version;
};
