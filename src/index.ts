/**
 * GitHub Copilot Plugin System
 * Main exports
 */

export { PluginClient } from './client.js';
export { PluginSession } from './session.js';
export { PluginManager } from './manager.js';
export { BUILTIN_PLUGINS, MemoryPreservationPlugin, LoggerPlugin, AnalyticsPlugin } from './builtin-plugins.js';
export type { Plugin, PluginContext, PluginConfig } from './types.js';

// Re-export everything from the base SDK for convenience
export * from '@github/copilot-sdk';
