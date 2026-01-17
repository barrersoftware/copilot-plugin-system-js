/**
 * GitHub Copilot Plugin System
 * Plugin-enhanced Copilot client
 */

import { CopilotClient } from '@github/copilot-sdk';
import type { CopilotClientOptions, SessionConfig, CopilotSession } from '@github/copilot-sdk';
import type { Plugin, PluginConfig, PluginContext } from './types.js';
import { PluginSession } from './session.js';

/**
 * Extended Copilot client with plugin support
 */
export class PluginClient extends CopilotClient {
  private plugins: Plugin[] = [];
  private debug: boolean = false;

  constructor(options?: CopilotClientOptions & { pluginConfig?: PluginConfig }) {
    super(options);
    
    if (options?.pluginConfig) {
      this.plugins = options.pluginConfig.plugins || [];
      this.debug = options.pluginConfig.debug || false;
    }
  }

  /**
   * Start the client and load plugins
   */
  override async start(): Promise<void> {
    await super.start();
    
    // Load all plugins
    for (const plugin of this.plugins) {
      if (plugin.onLoad) {
        if (this.debug) console.log(`[PluginClient] Loading plugin: ${plugin.name}`);
        await plugin.onLoad();
      }
    }
    
    if (this.debug) console.log(`[PluginClient] Loaded ${this.plugins.length} plugins`);
  }

  /**
   * Create a plugin-enhanced session
   */
  override async createSession(config?: SessionConfig): Promise<CopilotSession> {
    const session = await super.createSession(config);
    
    // Wrap session with plugin support
    const pluginSession = new PluginSession(session, this.plugins, this.debug);
    
    // Trigger onSessionCreated hooks
    const context: PluginContext = {
      session: pluginSession as any,
      data: new Map()
    };
    
    for (const plugin of this.plugins) {
      if (plugin.onSessionCreated) {
        if (this.debug) console.log(`[PluginClient] ${plugin.name}.onSessionCreated()`);
        await plugin.onSessionCreated(context);
      }
    }
    
    return pluginSession as any;
  }

  /**
   * Stop client and unload plugins
   */
  override async stop(): Promise<Error[]> {
    // Unload all plugins
    for (const plugin of this.plugins) {
      if (plugin.onUnload) {
        if (this.debug) console.log(`[PluginClient] Unloading plugin: ${plugin.name}`);
        await plugin.onUnload();
      }
    }
    
    return await super.stop();
  }

  /**
   * Add a plugin at runtime
   */
  async addPlugin(plugin: Plugin): Promise<void> {
    this.plugins.push(plugin);
    if (plugin.onLoad) {
      await plugin.onLoad();
    }
  }

  /**
   * Remove a plugin at runtime
   */
  async removePlugin(name: string): Promise<boolean> {
    const index = this.plugins.findIndex(p => p.name === name);
    if (index === -1) return false;
    
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
  getPlugins(): Plugin[] {
    return [...this.plugins];
  }
}
