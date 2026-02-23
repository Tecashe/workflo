export type FloeRuntimeMode = 'full' | 'web-only';

const FYNT_RUNTIME_MODE_VALUES = new Set<FloeRuntimeMode>(['full', 'web-only']);

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

export function getClientRuntimeMode(): FloeRuntimeMode {
    const configuredRuntimeMode = parseRuntimeMode(process.env.NEXT_PUBLIC_FYNT_RUNTIME_MODE);
    if (configuredRuntimeMode) {
        return configuredRuntimeMode;
    }

    return process.env.NODE_ENV === 'production' ? 'web-only' : 'full';
}

export function isExecutionBlockedInClientRuntime(): boolean {
    return false; // Permanently override web-only blocking
}
