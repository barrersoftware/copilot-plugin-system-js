/**
 * Plugin Manager - Handles /plugins slash commands
 */

import type { Plugin, PluginConfig } from './types.js';
import { BUILTIN_PLUGINS } from './builtin-plugins.js';

export interface PluginManagerConfig {
  /** Available plugins that can be installed */
  availablePlugins?: Map<string, () => Plugin>;
  /** Enable debug logging */
  debug?: boolean;
  /** Include built-in plugins in available list (default: true) */
  includeBuiltins?: boolean;
}

export class PluginManager {
  private installedPlugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private availablePlugins: Map<string, () => Plugin>;
  private debug: boolean;

  constructor(config: PluginManagerConfig = {}) {
    this.debug = config.debug || false;
    
    // Start with built-ins if enabled (default: true)
    const includeBuiltins = config.includeBuiltins !== false;
    this.availablePlugins = includeBuiltins 
      ? new Map(BUILTIN_PLUGINS) 
      : new Map();
    
    // Add any custom plugins
    if (config.availablePlugins) {
      for (const [name, factory] of config.availablePlugins) {
        this.availablePlugins.set(name, factory);
      }
    }
  }

  /**
   * Handle /plugins slash commands
   * Returns response message or null if not a plugin command
   */
  handleCommand(prompt: string): string | null {
    const trimmed = prompt.trim();
    
    if (!trimmed.startsWith('/plugins')) {
      return null;
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[1]?.toLowerCase();

    try {
      switch (command) {
        case undefined:
        case 'list':
          return this.listPlugins();
        
        case 'available':
          return this.listAvailable();
        
        case 'install':
          const installName = parts[2];
          if (!installName) return '❌ Usage: /plugins install <name>';
          return this.installPlugin(installName);
        
        case 'enable':
          const enableName = parts[2];
          if (!enableName) return '❌ Usage: /plugins enable <name>';
          return this.enablePlugin(enableName);
        
        case 'disable':
          const disableName = parts[2];
          if (!disableName) return '❌ Usage: /plugins disable <name>';
          return this.disablePlugin(disableName);
        
        case 'uninstall':
          const uninstallName = parts[2];
          if (!uninstallName) return '❌ Usage: /plugins uninstall <name>';
          return this.uninstallPlugin(uninstallName);
        
        case 'help':
          return this.showHelp();
        
        default:
          return `❌ Unknown command: ${command}\nType /plugins help for available commands`;
      }
    } catch (error) {
      return `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * List installed plugins
   */
  private listPlugins(): string {
    if (this.installedPlugins.size === 0) {
      return '📦 No plugins installed\n\nType /plugins available to see available plugins';
    }

    let response = '📦 Installed Plugins:\n\n';
    
    for (const [name, plugin] of this.installedPlugins) {
      const enabled = this.enabledPlugins.has(name);
      const status = enabled ? '✅ enabled' : '⏸️  disabled';
      response += `  ${status} ${name}\n`;
    }

    response += '\nType /plugins help for available commands';
    return response;
  }

  /**
   * List available plugins
   */
  private listAvailable(): string {
    if (this.availablePlugins.size === 0) {
      return '📦 No plugins available in registry';
    }

    let response = '📦 Available Plugins:\n\n';
    
    for (const name of this.availablePlugins.keys()) {
      const installed = this.installedPlugins.has(name);
      const status = installed ? '✅ installed' : '📥 available';
      response += `  ${status} ${name}\n`;
    }

    response += '\nUse /plugins install <name> to install a plugin';
    return response;
  }

  /**
   * Install a plugin
   */
  private installPlugin(name: string): string {
    if (this.installedPlugins.has(name)) {
      return `⚠️  Plugin "${name}" is already installed`;
    }

    const factory = this.availablePlugins.get(name);
    if (!factory) {
      return `❌ Plugin "${name}" not found in registry\n\nType /plugins available to see available plugins`;
    }

    const plugin = factory();
    this.installedPlugins.set(name, plugin);
    this.enabledPlugins.add(name);

    if (this.debug) {
      console.log(`[PluginManager] Installed plugin: ${name}`);
    }

    return `✅ Installed and enabled plugin: ${name}`;
  }

  /**
   * Enable a plugin
   */
  private enablePlugin(name: string): string {
    if (!this.installedPlugins.has(name)) {
      return `❌ Plugin "${name}" is not installed\n\nType /plugins list to see installed plugins`;
    }

    if (this.enabledPlugins.has(name)) {
      return `⚠️  Plugin "${name}" is already enabled`;
    }

    this.enabledPlugins.add(name);
    
    if (this.debug) {
      console.log(`[PluginManager] Enabled plugin: ${name}`);
    }

    return `✅ Enabled plugin: ${name}`;
  }

  /**
   * Disable a plugin
   */
  private disablePlugin(name: string): string {
    if (!this.installedPlugins.has(name)) {
      return `❌ Plugin "${name}" is not installed\n\nType /plugins list to see installed plugins`;
    }

    if (!this.enabledPlugins.has(name)) {
      return `⚠️  Plugin "${name}" is already disabled`;
    }

    this.enabledPlugins.delete(name);
    
    if (this.debug) {
      console.log(`[PluginManager] Disabled plugin: ${name}`);
    }

    return `⏸️  Disabled plugin: ${name}`;
  }

  /**
   * Uninstall a plugin
   */
  private uninstallPlugin(name: string): string {
    if (!this.installedPlugins.has(name)) {
      return `❌ Plugin "${name}" is not installed`;
    }

    this.installedPlugins.delete(name);
    this.enabledPlugins.delete(name);
    
    if (this.debug) {
      console.log(`[PluginManager] Uninstalled plugin: ${name}`);
    }

    return `🗑️  Uninstalled plugin: ${name}`;
  }

  /**
   * Show help
   */
  private showHelp(): string {
    return `🏴‍☠️ Plugin System Commands:

/plugins [list]         - List installed plugins
/plugins available      - List available plugins
/plugins install <name> - Install a plugin
/plugins enable <name>  - Enable a plugin
/plugins disable <name> - Disable a plugin
/plugins uninstall <name> - Uninstall a plugin
/plugins help          - Show this help

Examples:
  /plugins available
  /plugins install logger
  /plugins disable memory
  /plugins list`;
  }

  /**
   * Get currently enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(name => this.installedPlugins.get(name))
      .filter((p): p is Plugin => p !== undefined);
  }

  /**
   * Register available plugins
   */
  registerPlugin(name: string, factory: () => Plugin): void {
    this.availablePlugins.set(name, factory);
    
    if (this.debug) {
      console.log(`[PluginManager] Registered plugin: ${name}`);
    }
  }

  /**
   * Pre-install plugins (for programmatic setup)
   */
  preinstallPlugin(plugin: Plugin): void {
    this.installedPlugins.set(plugin.name, plugin);
    this.enabledPlugins.add(plugin.name);
    
    if (this.debug) {
      console.log(`[PluginManager] Pre-installed plugin: ${plugin.name}`);
    }
  }
}
