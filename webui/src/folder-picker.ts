import '@material/web/ripple/ripple.js';
import { exec } from './lib/kernelsu';
import { $, escapeHtml } from './ui';

const SAFE_PATH = /^\/[a-zA-Z0-9_/.-]+$/;
import type { MdDialog } from '@material/web/dialog/dialog.js';

const ROOT = '/sdcard';
const ICON_FOLDER =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';
const ICON_BACK =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';

let dialog: MdDialog | null = null;
let currentPath = ROOT;
let ac: AbortController;

const listDirectories = async (path: string): Promise<string[]> => {
    const { errno, stdout } = await exec(
        `cd "${path}" && for f in *; do [ -d "$f" ] && echo "$f"; done | sort`,
    );
    if (errno !== 0) throw new Error('Cannot access this directory');

    return stdout
        .trim()
        .split('\n')
        .filter((name) => name && name !== '*' && SAFE_PATH.test(`${path}/${name}`));
};

const buildBreadcrumbs = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    return segments
        .map((seg, i) => {
            const full = '/' + segments.slice(0, i + 1).join('/');
            return `<span class="fp-crumb" data-path="${escapeHtml(full)}">${escapeHtml(seg)}</span>`;
        })
        .join('<span class="fp-sep">/</span>');
};

const ensureDialog = (): MdDialog => {
    if (dialog) return dialog;
    const el = document.createElement('md-dialog');
    el.id = 'folder-picker-dialog';
    el.innerHTML = `
        <div slot="headline" class="fp-header">
            <md-icon-button id="fp-back" aria-label="Go back">${ICON_BACK}</md-icon-button>
            <div class="fp-breadcrumbs" id="fp-breadcrumbs"></div>
        </div>
        <div slot="content">
            <md-linear-progress id="fp-progress" indeterminate hidden></md-linear-progress>
            <div class="fp-file-list" id="fp-list"></div>
        </div>
        <div slot="actions">
            <md-text-button id="fp-cancel">Cancel</md-text-button>
            <md-filled-button id="fp-select">Select</md-filled-button>
        </div>`;
    document.body.appendChild(el);
    dialog = el as MdDialog;
    return dialog;
};

const navigateTo = async (path: string): Promise<void> => {
    const list = $('fp-list');
    const progress = $('fp-progress');

    // Skip transition on first render (empty list)
    if (list.children.length > 0) {
        list.classList.add('switching');
        await new Promise((r) => setTimeout(r, 150));
    }

    $('fp-breadcrumbs').innerHTML = buildBreadcrumbs(path);
    $('fp-back').hidden = path === ROOT;
    progress.hidden = false;
    list.innerHTML = '';
    list.classList.remove('switching');

    try {
        const dirs = await listDirectories(path);
        currentPath = path;
        progress.hidden = true;

        if (dirs.length === 0) {
            list.innerHTML = '<div class="fp-empty">No subfolders</div>';
        } else {
            list.innerHTML = dirs
                .map(
                    (name) =>
                        `<div class="fp-item" data-dir="${escapeHtml(name)}">` +
                        `<md-ripple></md-ripple>` +
                        `<span class="fp-item-icon">${ICON_FOLDER}</span>` +
                        `<span class="fp-item-name">${escapeHtml(name)}</span>` +
                        `</div>`,
                )
                .join('');
        }

        for (const item of list.querySelectorAll<HTMLElement>('.fp-item')) {
            item.addEventListener(
                'click',
                () => navigateTo(`${currentPath}/${item.dataset.dir!}`),
                { signal: ac.signal },
            );
        }

        for (const crumb of $('fp-breadcrumbs').querySelectorAll<HTMLElement>('.fp-crumb')) {
            crumb.addEventListener(
                'click',
                () => {
                    const target = crumb.dataset.path!;
                    if (target.length >= ROOT.length && target !== currentPath) navigateTo(target);
                },
                { signal: ac.signal },
            );
        }
    } catch {
        progress.hidden = true;
        list.innerHTML = '<div class="fp-error">Cannot access this directory</div>';
    }
};

export const showFolderPicker = (startPath: string): Promise<string | null> =>
    new Promise((resolve) => {
        ac = new AbortController();
        const dlg = ensureDialog();
        const startDir = SAFE_PATH.test(startPath) ? startPath : ROOT;

        const done = (picked: string | null) => {
            if (ac.signal.aborted) return;
            ac.abort();
            if (dlg.open) dlg.close();
            resolve(picked);
        };

        $('fp-back').addEventListener(
            'click',
            () => {
                const parent = currentPath.replace(/\/[^/]+$/, '') || '/';
                if (parent.length >= ROOT.length) navigateTo(parent);
            },
            { signal: ac.signal },
        );
        $('fp-cancel').addEventListener('click', () => done(null), { signal: ac.signal });
        $('fp-select').addEventListener('click', () => done(currentPath), { signal: ac.signal });
        dlg.addEventListener('closed', () => done(null), { signal: ac.signal });

        dlg.show();
        navigateTo(startDir);
    });
