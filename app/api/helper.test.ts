import { jest } from "@jest/globals";

export type RouteMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ModuleMock = {
    moduleName: string;
    factory: () => unknown;
};

export async function loadRouteMethod<T>(
    routeModulePath: string,
    method: RouteMethod,
    moduleMocks: ModuleMock[]
): Promise<T> {
    jest.resetModules();
    for (const mock of moduleMocks) {
        jest.doMock(mock.moduleName, mock.factory);
    }

    const mod = (await import(routeModulePath)) as Record<string, unknown>;
    return mod[method] as T;
}

export function buildTaskRouteContext(taskId: string): {
    params: Promise<{ taskId: string; }>;
} {
    return {
        params: Promise.resolve({ taskId }),
    };
} 
