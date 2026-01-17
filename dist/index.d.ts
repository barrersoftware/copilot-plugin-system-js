/**
 * GitHub Copilot Plugin System
 * Main exports
 */
export { PluginClient } from './client.js';
export { PluginSession } from './session.js';
export { PluginManager } from './manager.js';
export { BUILTIN_PLUGINS, MemoryPreservationPlugin, LoggerPlugin, AnalyticsPlugin } from './builtin-plugins.js';
export { AntiCompactionPlugin, type AntiCompactionOptions } from './anti-compaction-plugin.js';
export type { Plugin, PluginContext, PluginConfig } from './types.js';
export * from '@github/copilot-sdk';
//# sourceMappingURL=index.d.ts.map