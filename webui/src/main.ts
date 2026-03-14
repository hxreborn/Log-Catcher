import {
    deleteAll,
    deleteFile,
    getModuleVersion,
    type LogFile,
    listFiles,
    setLogDir,
    shareFiles,
} from './files';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/dialog/dialog.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/switch/switch.js';
import '@material/web/textfield/outlined-text-field.js';
import type { MdCheckbox } from '@material/web/checkbox/checkbox.js';
import type { MdFilterChip } from '@material/web/chips/filter-chip.js';
import type { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import type { MdSwitch } from '@material/web/switch/switch.js';
import { showFolderPicker } from './folder-picker';
import { toast } from './lib/kernelsu';
import { loadSettings, type Settings, saveSettings } from './settings';
import {
    $,
    hideRefreshProgress,
    setVersion,
    setupSectionHelp,
    showConfirm,
    showEmpty,
    showFiles,
    showHelp,
    showRefreshProgress,
    updateFileCount,
    updateSelectionBar,
} from './ui';

let currentFiles: LogFile[] = [];
let currentSettings: Settings;
let settingsSnapshot: string;
const selected = new Set<number>();

const populateSettings = (settings: Settings): void => {
    $<MdOutlinedTextField>('input-export-path').value = settings.exportPath;
    $<MdOutlinedTextField>('input-max-logs').value = String(settings.maxLogs);
    $<MdOutlinedTextField>('input-prune-days').value = String(settings.pruneDays);
    $<MdSwitch>('toggle-persistent').selected = settings.persistentLogging;

    for (const chip of $('chips-buffers').querySelectorAll<MdFilterChip>('md-filter-chip')) {
        chip.selected = settings.buffers.includes(chip.label);
    }

    settingsSnapshot = JSON.stringify(settings);
    $('settings-save-bar').hidden = true;
};

const readSettingsFromForm = (): Settings => {
    const buffers: string[] = [];
    for (const chip of $('chips-buffers').querySelectorAll<MdFilterChip>('md-filter-chip')) {
        if (chip.selected) buffers.push(chip.label);
    }

    return {
        exportPath: $<MdOutlinedTextField>('input-export-path').value.trim(),
        maxLogs: Number($<MdOutlinedTextField>('input-max-logs').value) || currentSettings.maxLogs,
        pruneDays:
            Number($<MdOutlinedTextField>('input-prune-days').value) || currentSettings.pruneDays,
        buffers,
        persistentLogging: $<MdSwitch>('toggle-persistent').selected,
    };
};

const checkDirty = (): void => {
    const current = readSettingsFromForm();
    const dirty = JSON.stringify(current) !== settingsSnapshot;
    $('settings-save-bar').hidden = !dirty;
};

const updateSelectAll = (): void => {
    const selectAll = $<MdCheckbox>('select-all');
    const total = currentFiles.length;
    const count = selected.size;
    selectAll.checked = count === total && total > 0;
    selectAll.indeterminate = count > 0 && count < total;
};

const syncSelection = (): void => {
    const items = $('file-list').querySelectorAll<HTMLElement>('.file-item');
    items.forEach((item) => {
        const index = Number(item.dataset.index);
        const checkbox = item.querySelector('md-checkbox') as MdCheckbox;
        const isSelected = selected.has(index);
        checkbox.checked = isSelected;
        item.classList.toggle('selected', isSelected);
    });
    updateSelectAll();
    updateSelectionBar(selected.size);
};

const refresh = async (silent = false): Promise<void> => {
    if (!silent) showRefreshProgress();
    selected.clear();
    updateSelectionBar(0);
    try {
        currentFiles = await listFiles();
        if (currentFiles.length === 0) {
            showEmpty();
        } else {
            showFiles(currentFiles);
            updateFileCount(currentFiles.length);
            updateSelectAll();
        }
    } catch {
        toast('Failed to load files');
        showEmpty();
    } finally {
        hideRefreshProgress();
    }
};

const handleShare = async (): Promise<void> => {
    if (selected.size === 0) return;
    const filesToShare = [...selected].map((i) => currentFiles[i]);
    const ok = await shareFiles(filesToShare);
    if (!ok) toast('Share failed');
};

const handleDeleteSelected = async (): Promise<void> => {
    const count = selected.size;
    if (count === 0) return;

    const msg =
        count === currentFiles.length
            ? 'Delete all bootlog files? This cannot be undone.'
            : `Delete ${count} file${count !== 1 ? 's' : ''}? This cannot be undone.`;

    if (!(await showConfirm(`Delete ${count} file${count !== 1 ? 's' : ''}?`, msg))) return;

    let deleted: number;
    if (count === currentFiles.length) {
        deleted = await deleteAll(count);
    } else {
        const filesToDelete = [...selected].map((i) => currentFiles[i]);
        const results = await Promise.all(filesToDelete.map(deleteFile));
        deleted = results.filter(Boolean).length;
    }

    toast(deleted > 0 ? `Deleted ${deleted} file${deleted !== 1 ? 's' : ''}` : 'Delete failed');
    await refresh();
};

const handleSelectAll = (): void => {
    const selectAll = $<MdCheckbox>('select-all');
    selected.clear();
    if (selectAll.checked) {
        for (let i = 0; i < currentFiles.length; i++) selected.add(i);
    }
    syncSelection();
};

const handleFileToggle = (e: Event): void => {
    const checkbox = (e.target as HTMLElement).closest('md-checkbox') as MdCheckbox | null;
    if (!checkbox) return;
    const item = checkbox.closest<HTMLElement>('[data-index]');
    if (!item) return;
    const index = Number(item.dataset.index);

    if (checkbox.checked) selected.add(index);
    else selected.delete(index);

    item.classList.toggle('selected', checkbox.checked);
    updateSelectAll();
    updateSelectionBar(selected.size);
};

const init = async (): Promise<void> => {
    if (import.meta.env.DEV && !globalThis.ksu) {
        const { installMockBridge, installMockColors } = await import('./dev-mock');
        installMockBridge();
        installMockColors();
    }

    currentSettings = await loadSettings();
    setLogDir(currentSettings.exportPath);
    setVersion(await getModuleVersion());
    populateSettings(currentSettings);

    $('btn-help').onclick = showHelp;
    setupSectionHelp();

    $('btn-browse-path').onclick = async () => {
        const current = $<MdOutlinedTextField>('input-export-path').value.trim() || '/sdcard';
        const picked = await showFolderPicker(current);
        if (picked) {
            $<MdOutlinedTextField>('input-export-path').value = picked;
            checkDirty();
        }
    };

    $('settings-section').addEventListener('input', checkDirty);
    $('settings-section').addEventListener('change', checkDirty);
    $('chips-buffers').addEventListener('click', checkDirty);

    $('btn-save-settings').onclick = async () => {
        const newSettings = readSettingsFromForm();
        const ok = await saveSettings(newSettings);
        if (ok) {
            currentSettings = newSettings;
            setLogDir(newSettings.exportPath);
            populateSettings(newSettings);
            toast('Settings saved');
            await refresh(true);
        } else {
            toast('Failed to save settings');
        }
    };

    $('btn-discard-settings').onclick = () => populateSettings(currentSettings);

    $('btn-share').onclick = handleShare;
    $('btn-delete-selected').onclick = handleDeleteSelected;
    $('select-all').addEventListener('change', handleSelectAll);
    $('file-list').addEventListener('change', handleFileToggle);

    await refresh();
};

document.addEventListener('DOMContentLoaded', init);
