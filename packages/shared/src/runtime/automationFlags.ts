export type FloeRuntimeMode = 'full' | 'web-only';

const FLOE_RUNTIME_MODE_VALUES = new Set<FloeRuntimeMode>(['full', 'web-only']);

function isProductionRuntime(): boolean {
    return process.env.NODE_ENV === 'production';
}

function parseRuntimeMode(value: string | undefined): FloeRuntimeMode | null {
    if (!value) {
        return null;
    }

    const normalized = value.trim().toLowerCase();
    if (FLOE_RUNTIME_MODE_VALUES.has(normalized as FloeRuntimeMode)) {
        return normalized as FloeRuntimeMode;
    }

    return null;
}

function isProductionAutomationExplicitlyEnabled(): boolean {
    return process.env.FLOE_ENABLE_AUTOMATION_IN_PRODUCTION === 'true';
}

export function getFloeRuntimeMode(): FloeRuntimeMode {
    return 'full';
}

export function isWebOnlyRuntimeMode(): boolean {
    return false;
}

export function isExecutionDisabledForRuntime(): boolean {
    return false;
}

export function isAutomationDisabledInProduction(): boolean {
    return false;
}

export function isWorkflowSourceDisabledInProduction(source: string | null | undefined): boolean {
    return false;
}
