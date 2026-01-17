/**
 * GitHub Copilot Plugin System
 * Plugin-enhanced session wrapper
 */
/**
 * Session wrapper that runs plugins before/after operations
 */
export class PluginSession {
    inner;
    plugins;
    debug;
    pluginManager;
    context;
    constructor(inner, plugins, debug = false, pluginManager) {
        this.inner = inner;
        this.plugins = plugins;
        this.debug = debug;
        this.pluginManager = pluginManager;
        this.context = {
            session: inner,
            data: new Map()
        };
        // Subscribe to compaction events (opt-in for plugins)
        this.setupCompactionListeners();
    }
    get sessionId() {
        return this.inner.sessionId;
    }
    /**
     * Send message with plugin pipeline
     */
    async send(options) {
        // Check for /plugins commands
        if (this.pluginManager && options.prompt) {
            const commandResponse = await this.pluginManager.handleCommand(options.prompt);
            if (commandResponse) {
                // Intercept and send command response
                return await this.inner.send({
                    ...options,
                    prompt: `System: ${commandResponse}`
                });
            }
        }
        let modifiedOptions = options;
        // Run onBeforeSend hooks
        for (const plugin of this.plugins) {
            if (plugin.onBeforeSend) {
                if (this.debug)
                    console.log(`[PluginSession] ${plugin.name}.onBeforeSend()`);
                modifiedOptions = await plugin.onBeforeSend(this.context, modifiedOptions);
            }
        }
        return await this.inner.send(modifiedOptions);
    }
    /**
     * Send and wait with plugin pipeline
     */
    async sendAndWait(options, timeout) {
        // Check for /plugins commands
        if (this.pluginManager && options.prompt) {
            const commandResponse = await this.pluginManager.handleCommand(options.prompt);
            if (commandResponse) {
                // Return command response as message content
                return {
                    content: commandResponse,
                    role: 'assistant'
                };
            }
        }
        let modifiedOptions = options;
        // Run onBeforeSend hooks
        for (const plugin of this.plugins) {
            if (plugin.onBeforeSend) {
                if (this.debug)
                    console.log(`[PluginSession] ${plugin.name}.onBeforeSend()`);
                modifiedOptions = await plugin.onBeforeSend(this.context, modifiedOptions);
            }
        }
        let response = await this.inner.sendAndWait(modifiedOptions, timeout);
        // Run onAfterReceive hooks
        for (const plugin of this.plugins) {
            if (plugin.onAfterReceive) {
                if (this.debug)
                    console.log(`[PluginSession] ${plugin.name}.onAfterReceive()`);
                response = await plugin.onAfterReceive(this.context, response);
            }
        }
        return response;
    }
    /**
     * Setup listeners for compaction events (opt-in)
     */
    setupCompactionListeners() {
        // Check if any plugins want compaction events
        const hasCompactionPlugins = this.plugins.some(p => p.onCompactionStart || p.onCompactionComplete);
        if (!hasCompactionPlugins) {
            return; // No plugins care about compaction, skip setup
        }
        // Listen for compaction events
        this.inner.on((event) => {
            if (event.type === 'session.compaction_start') {
                for (const plugin of this.plugins) {
                    if (plugin.onCompactionStart) {
                        if (this.debug)
                            console.log(`[PluginSession] ${plugin.name}.onCompactionStart()`);
                        plugin.onCompactionStart(this.context, {
                            preCompactionTokens: event.data.preCompactionTokens,
                            preCompactionMessagesLength: event.data.preCompactionMessagesLength
                        });
                    }
                }
            }
            else if (event.type === 'session.compaction_complete') {
                for (const plugin of this.plugins) {
                    if (plugin.onCompactionComplete) {
                        if (this.debug)
                            console.log(`[PluginSession] ${plugin.name}.onCompactionComplete()`);
                        plugin.onCompactionComplete(this.context, event.data);
                    }
                }
            }
        });
    }
    /**
     * Destroy session and trigger onSessionEnd
     */
    async destroy() {
        // Run onSessionEnd hooks
        for (const plugin of this.plugins) {
            if (plugin.onSessionEnd) {
                if (this.debug)
                    console.log(`[PluginSession] ${plugin.name}.onSessionEnd()`);
                await plugin.onSessionEnd(this.context);
            }
        }
        await this.inner.destroy();
    }
    /**
     * Proxy all other methods to inner session
     */
    on(...args) {
        return this.inner.on(...args);
    }
    abort(...args) {
        return this.inner.abort(...args);
    }
    getMessages(...args) {
        return this.inner.getMessages(...args);
    }
    registerTools(...args) {
        return this.inner.registerTools(...args);
    }
    registerPermissionHandler(...args) {
        return this.inner.registerPermissionHandler(...args);
    }
    /**
     * Get plugin-specific data
     */
    getPluginData(key) {
        return this.context.data.get(key);
    }
    /**
     * Set plugin-specific data
     */
    setPluginData(key, value) {
        this.context.data.set(key, value);
    }
}
//# sourceMappingURL=session.js.map