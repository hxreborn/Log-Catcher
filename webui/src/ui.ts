import type { MdDialog } from '@material/web/dialog/dialog.js';

export const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

export const escapeHtml = (str: string): string =>
    str.replaceAll(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

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
