import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/dialog/dialog.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/switch/switch.js';
import '@material/web/textfield/outlined-text-field.js';
import type { MdFilterChip } from '@material/web/chips/filter-chip.js';
import type { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import type { MdSwitch } from '@material/web/switch/switch.js';
import { showFolderPicker } from './folder-picker';
import { toast } from './lib/kernelsu';
import { loadSettings, type Settings, saveSettings, getModuleVersion } from './settings';
import { $, setVersion, setupSectionHelp, showHelp } from './ui';

let currentSettings: Settings;
let settingsSnapshot: string;

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

const init = async (): Promise<void> => {
    if (import.meta.env.DEV && !globalThis.ksu) {
        const { installMockBridge, installMockColors } = await import('./dev-mock');
        installMockBridge();
        installMockColors();
    }

    currentSettings = await loadSettings();
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
            populateSettings(newSettings);
            toast('Settings saved');
        } else {
            toast('Failed to save settings');
        }
    };

    $('btn-discard-settings').onclick = () => populateSettings(currentSettings);

    $('settings-section').removeAttribute('unresolved');
};

document.addEventListener('DOMContentLoaded', init);
