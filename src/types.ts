/**
 * GitHub Copilot Plugin System
 * Core plugin interfaces and types
 */

import type { CopilotSession, MessageOptions } from '@github/copilot-sdk';

/**
 * Plugin context passed to plugin hooks
 */
export interface PluginContext {
  /** Current session */
  session: CopilotSession;
  /** Plugin-specific data storage */
  data: Map<string, any>;
}

/**
 * Base plugin interface
 */
export interface Plugin {
  /** Unique plugin identifier */
  name: string;
  
  /** Called when plugin is loaded */
  onLoad?(): Promise<void> | void;
  
  /** Called when a session is created */
  onSessionCreated?(context: PluginContext): Promise<void> | void;
  
  /** Called before a message is sent */
  onBeforeSend?(context: PluginContext, options: MessageOptions): Promise<MessageOptions> | MessageOptions;
  
  /** Called after a response is received */
  onAfterReceive?(context: PluginContext, response: any): Promise<any> | any;
  
  /** Called when session ends */
  onSessionEnd?(context: PluginContext): Promise<void> | void;
  
  /** Called when plugin is unloaded */
  onUnload?(): Promise<void> | void;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  /** List of plugins to load */
  plugins: Plugin[];
  
  /** Enable debug logging */
  debug?: boolean;
}
