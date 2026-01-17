/**
 * GitHub Copilot Plugin System
 * Plugin-enhanced Copilot client
 */
import { CopilotClient } from '@github/copilot-sdk';
import type { CopilotClientOptions, SessionConfig, CopilotSession } from '@github/copilot-sdk';
import type { Plugin, PluginConfig } from './types.js';
/**
 * Extended Copilot client with plugin support
 */
export declare class PluginClient extends CopilotClient {
    private plugins;
    private debug;
    constructor(options?: CopilotClientOptions & {
        pluginConfig?: PluginConfig;
    });
    /**
     * Start the client and load plugins
     */
    start(): Promise<void>;
    /**
     * Create a plugin-enhanced session
     */
    createSession(config?: SessionConfig): Promise<CopilotSession>;
    /**
     * Stop client and unload plugins
     */
    stop(): Promise<Error[]>;
    /**
     * Add a plugin at runtime
     */
    addPlugin(plugin: Plugin): Promise<void>;
    /**
     * Remove a plugin at runtime
     */
    removePlugin(name: string): Promise<boolean>;
    /**
     * Get loaded plugins
     */
    getPlugins(): Plugin[];
}
//# sourceMappingURL=client.d.ts.map