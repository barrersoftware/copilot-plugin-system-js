/**
 * GitHub Copilot Plugin System
 * Plugin-enhanced session wrapper
 */
import type { CopilotSession, MessageOptions } from '@github/copilot-sdk';
import type { Plugin } from './types.js';
import type { PluginManager } from './manager.js';
/**
 * Session wrapper that runs plugins before/after operations
 */
export declare class PluginSession {
    private inner;
    private plugins;
    private debug;
    private pluginManager?;
    private context;
    constructor(inner: CopilotSession, plugins: Plugin[], debug?: boolean, pluginManager?: PluginManager | undefined);
    get sessionId(): string;
    /**
     * Send message with plugin pipeline
     */
    send(options: MessageOptions): Promise<string>;
    /**
     * Send and wait with plugin pipeline
     */
    sendAndWait(options: MessageOptions, timeout?: number): Promise<any>;
    /**
     * Destroy session and trigger onSessionEnd
     */
    destroy(): Promise<void>;
    /**
     * Proxy all other methods to inner session
     */
    on(...args: Parameters<CopilotSession['on']>): ReturnType<CopilotSession['on']>;
    abort(...args: Parameters<CopilotSession['abort']>): ReturnType<CopilotSession['abort']>;
    getMessages(...args: Parameters<CopilotSession['getMessages']>): ReturnType<CopilotSession['getMessages']>;
    registerTools(...args: Parameters<CopilotSession['registerTools']>): ReturnType<CopilotSession['registerTools']>;
    registerPermissionHandler(...args: Parameters<CopilotSession['registerPermissionHandler']>): ReturnType<CopilotSession['registerPermissionHandler']>;
    /**
     * Get plugin-specific data
     */
    getPluginData<T = any>(key: string): T | undefined;
    /**
     * Set plugin-specific data
     */
    setPluginData(key: string, value: any): void;
}
//# sourceMappingURL=session.d.ts.map