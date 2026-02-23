export type FloeRuntimeMode = 'full' | 'web-only';

const FYNT_RUNTIME_MODE_VALUES = new Set<FloeRuntimeMode>(['full', 'web-only']);

function isProductionRuntime(): boolean {
    return process.env.NODE_ENV === 'production';
}

function parseRuntimeMode(value: string | undefined): FloeRuntimeMode | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim().toLowerCase();
    if (FYNT_RUNTIME_MODE_VALUES.has(normalized as FloeRuntimeMode)) {
        return normalized as FloeRuntimeMode;
    }

    return null;
}

function isProductionAutomationExplicitlyEnabled(): boolean {
    return process.env.FYNT_ENABLE_AUTOMATION_IN_PRODUCTION === 'true';
}

export function getFloeRuntimeMode(): FloeRuntimeMode {
    const configuredRuntimeMode = parseRuntimeMode(process.env.FYNT_RUNTIME_MODE);
    if (configuredRuntimeMode) {
        return configuredRuntimeMode;
    }

    return isProductionRuntime() ? 'web-only' : 'full';
}

export function isWebOnlyRuntimeMode(): boolean {
    return getFloeRuntimeMode() === 'web-only';
}

export function isExecutionDisabledForRuntime(): boolean {
    return isWebOnlyRuntimeMode();
}

export function isAutomationDisabledInProduction(): boolean {
    if (isWebOnlyRuntimeMode()) {
        return true;
    }

    if (!isProductionRuntime()) {
        return false;
    }

    return !isProductionAutomationExplicitlyEnabled();
}

export function isWorkflowSourceDisabledInProduction(source: string | null | undefined): boolean {
    if (!isAutomationDisabledInProduction()) {
        return false;
    }
    return source === 'webhook' || source === 'cron';
}
