/**
 * GitHub Copilot Plugin System
 * Plugin-enhanced session wrapper
 */

import type { CopilotSession, MessageOptions } from '@github/copilot-sdk';
import type { Plugin, PluginContext } from './types.js';
import type { PluginManager } from './manager.js';

/**
 * Session wrapper that runs plugins before/after operations
 */
export class PluginSession {
  private context: PluginContext;

  constructor(
    private inner: CopilotSession,
    private plugins: Plugin[],
    private debug: boolean = false,
    private pluginManager?: PluginManager
  ) {
    this.context = {
      session: inner,
      data: new Map()
    };
    
    // Subscribe to compaction events (opt-in for plugins)
    this.setupCompactionListeners();
  }

  get sessionId(): string {
    return this.inner.sessionId;
  }

  /**
   * Send message with plugin pipeline
   */
  async send(options: MessageOptions): Promise<string> {
    // Check for /plugins commands
    if (this.pluginManager && options.prompt) {
      const commandResponse = this.pluginManager.handleCommand(options.prompt);
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
        if (this.debug) console.log(`[PluginSession] ${plugin.name}.onBeforeSend()`);
        modifiedOptions = await plugin.onBeforeSend(this.context, modifiedOptions);
      }
    }
    
    return await this.inner.send(modifiedOptions);
  }

  /**
   * Send and wait with plugin pipeline
   */
  async sendAndWait(options: MessageOptions, timeout?: number): Promise<any> {
    // Check for /plugins commands
    if (this.pluginManager && options.prompt) {
      const commandResponse = this.pluginManager.handleCommand(options.prompt);
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
        if (this.debug) console.log(`[PluginSession] ${plugin.name}.onBeforeSend()`);
        modifiedOptions = await plugin.onBeforeSend(this.context, modifiedOptions);
      }
    }
    
    let response = await this.inner.sendAndWait(modifiedOptions, timeout);
    
    // Run onAfterReceive hooks
    for (const plugin of this.plugins) {
      if (plugin.onAfterReceive) {
        if (this.debug) console.log(`[PluginSession] ${plugin.name}.onAfterReceive()`);
        response = await plugin.onAfterReceive(this.context, response);
      }
    }
    
    return response;
  }

  /**
   * Setup listeners for compaction events (opt-in)
   */
  private setupCompactionListeners(): void {
    // Check if any plugins want compaction events
    const hasCompactionPlugins = this.plugins.some(p => p.onCompactionStart || p.onCompactionComplete);
    
    if (!hasCompactionPlugins) {
      return; // No plugins care about compaction, skip setup
    }
    
    // Listen for compaction events
    this.inner.on((event: any) => {
      if (event.type === 'session.compaction_start') {
        for (const plugin of this.plugins) {
          if (plugin.onCompactionStart) {
            if (this.debug) console.log(`[PluginSession] ${plugin.name}.onCompactionStart()`);
            plugin.onCompactionStart(this.context, {
              preCompactionTokens: event.data.preCompactionTokens,
              preCompactionMessagesLength: event.data.preCompactionMessagesLength
            });
          }
        }
      } else if (event.type === 'session.compaction_complete') {
        for (const plugin of this.plugins) {
          if (plugin.onCompactionComplete) {
            if (this.debug) console.log(`[PluginSession] ${plugin.name}.onCompactionComplete()`);
            plugin.onCompactionComplete(this.context, event.data);
          }
        }
      }
    });
  }

  /**
   * Destroy session and trigger onSessionEnd
   */
  async destroy(): Promise<void> {
    // Run onSessionEnd hooks
    for (const plugin of this.plugins) {
      if (plugin.onSessionEnd) {
        if (this.debug) console.log(`[PluginSession] ${plugin.name}.onSessionEnd()`);
        await plugin.onSessionEnd(this.context);
      }
    }
    
    await this.inner.destroy();
  }

  /**
   * Proxy all other methods to inner session
   */
  on(...args: Parameters<CopilotSession['on']>): ReturnType<CopilotSession['on']> {
    return this.inner.on(...args);
  }

  abort(...args: Parameters<CopilotSession['abort']>): ReturnType<CopilotSession['abort']> {
    return this.inner.abort(...args);
  }

  getMessages(...args: Parameters<CopilotSession['getMessages']>): ReturnType<CopilotSession['getMessages']> {
    return this.inner.getMessages(...args);
  }

  registerTools(...args: Parameters<CopilotSession['registerTools']>): ReturnType<CopilotSession['registerTools']> {
    return this.inner.registerTools(...args);
  }

  registerPermissionHandler(...args: Parameters<CopilotSession['registerPermissionHandler']>): ReturnType<CopilotSession['registerPermissionHandler']> {
    return this.inner.registerPermissionHandler(...args);
  }

  /**
   * Get plugin-specific data
   */
  getPluginData<T = any>(key: string): T | undefined {
    return this.context.data.get(key);
  }

  /**
   * Set plugin-specific data
   */
  setPluginData(key: string, value: any): void {
    this.context.data.set(key, value);
  }
}
