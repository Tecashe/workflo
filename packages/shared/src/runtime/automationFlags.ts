export type FloeRuntimeMode = 'full' | 'web-only';

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

export function isWorkflowSourceDisabledInProduction(_source?: string | null): boolean {
    return false;
}
