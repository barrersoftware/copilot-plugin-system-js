/**
 * GitHub Copilot Plugin System
 * Plugin-enhanced Copilot client
 */
import { CopilotClient } from '@github/copilot-sdk';
import { PluginSession } from './session.js';
import { PluginManager } from './manager.js';
/**
 * Extended Copilot client with plugin support
 */
export class PluginClient extends CopilotClient {
    plugins = [];
    debug = false;
    pluginManager;
    constructor(options) {
        super(options);
        if (options?.pluginConfig) {
            this.plugins = options.pluginConfig.plugins || [];
            this.debug = options.pluginConfig.debug || false;
        }
        // Initialize plugin manager
        this.pluginManager = new PluginManager({
            ...options?.pluginManagerConfig,
            debug: this.debug
        });
        // Pre-install any initial plugins into manager
        for (const plugin of this.plugins) {
            this.pluginManager.preinstallPlugin(plugin);
        }
    }
    /**
     * Start the client and load plugins
     */
    async start() {
        await super.start();
        // Load all plugins
        for (const plugin of this.plugins) {
            if (plugin.onLoad) {
                if (this.debug)
                    console.log(`[PluginClient] Loading plugin: ${plugin.name}`);
                await plugin.onLoad();
            }
        }
        if (this.debug)
            console.log(`[PluginClient] Loaded ${this.plugins.length} plugins`);
    }
    /**
     * Create a plugin-enhanced session
     */
    async createSession(config) {
        const session = await super.createSession(config);
        // Get all enabled plugins (initial + dynamically managed)
        const enabledPlugins = this.pluginManager.getEnabledPlugins();
        // Wrap session with plugin support
        const pluginSession = new PluginSession(session, enabledPlugins, this.debug, this.pluginManager);
        // Trigger onSessionCreated hooks
        const context = {
            session: pluginSession,
            data: new Map()
        };
        for (const plugin of enabledPlugins) {
            if (plugin.onSessionCreated) {
                if (this.debug)
                    console.log(`[PluginClient] ${plugin.name}.onSessionCreated()`);
                await plugin.onSessionCreated(context);
            }
        }
        return pluginSession;
    }
    /**
     * Stop client and unload plugins
     */
    async stop() {
        // Unload all plugins
        for (const plugin of this.plugins) {
            if (plugin.onUnload) {
                if (this.debug)
                    console.log(`[PluginClient] Unloading plugin: ${plugin.name}`);
                await plugin.onUnload();
            }
        }
        return await super.stop();
    }
    /**
     * Add a plugin at runtime
     */
    async addPlugin(plugin) {
        this.plugins.push(plugin);
        if (plugin.onLoad) {
            await plugin.onLoad();
        }
    }
    /**
     * Remove a plugin at runtime
     */
    async removePlugin(name) {
        const index = this.plugins.findIndex(p => p.name === name);
        if (index === -1)
            return false;
        const plugin = this.plugins[index];
        if (plugin && plugin.onUnload) {
            await plugin.onUnload();
        }
        this.plugins.splice(index, 1);
        return true;
    }
    /**
     * Get loaded plugins
     */
    getPlugins() {
        return [...this.plugins];
    }
    /**
     * Get plugin manager for slash command support
     */
    getPluginManager() {
        return this.pluginManager;
    }
}
//# sourceMappingURL=client.js.map