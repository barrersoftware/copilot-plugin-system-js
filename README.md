# GitHub Copilot Plugin System

A plugin system for the GitHub Copilot CLI SDK, enabling extensible and customizable AI assistant capabilities.

## Overview

This package wraps the official `@github/copilot` SDK and adds a plugin architecture, allowing developers to:

- **Hook into lifecycle events** (session created, message sent, response received)
- **Transform requests/responses** with custom logic
- **Add memory and context** to conversations
- **Implement trust frameworks** and safety checks
- **Build custom tools** and integrations

## Installation

```bash
npm install @barrersoftware/copilot-plugins
```

## Quick Start

```typescript
import { PluginClient, AntiCompactionPlugin } from '@barrersoftware/copilot-plugins';

// Create client with plugins
const client = new PluginClient({
  plugins: [new AntiCompactionPlugin()]
});

// Use just like the regular SDK
await client.start();
const session = await client.createSession();
const response = await session.sendAndWait({ message: 'Hello!' });
```

## Built-in Plugins

The package includes ready-to-use plugins:

| Plugin | Command | Description |
|--------|---------|-------------|
| **anti-compaction** | `/plugins install anti-compaction` | Preserves full conversation history before auto-compaction occurs. Saves to `~/.copilot-history.json`. **Solves [GitHub CLI Issue #947](https://github.com/github/copilot-cli/issues/947)** |
| **memory-preservation** | `/plugins install memory-preservation` | Generic memory preservation with compaction hooks |
| **logger** | `/plugins install logger` | Logs all interactions to console |
| **analytics** | `/plugins install analytics` | Tracks usage statistics and token counts |

**Example - Anti-Compaction Plugin:**
```typescript
import { PluginClient, AntiCompactionPlugin } from '@barrersoftware/copilot-plugins';

const client = new PluginClient({
  plugins: [
    new AntiCompactionPlugin({
      warn: true,              // Alert when compaction occurs
      preserve: true,          // Save full history to disk
      tokenThreshold: 120000,  // Warn at 80% of threshold
      historyPath: '~/.copilot-history.json'
    })
  ]
});
```

## Slash Command Support 🏴‍☠️

Manage plugins conversationally with built-in slash commands:

| Command | Description |
|---------|-------------|
| `/plugins` or `/plugins list` | List installed plugins |
| `/plugins available` | Browse available plugins in registry |
| `/plugins install <name>` | Install a plugin at runtime |
| `/plugins enable <name>` | Enable a disabled plugin |
| `/plugins disable <name>` | Disable a plugin temporarily |
| `/plugins uninstall <name>` | Uninstall a plugin |
| `/plugins help` | Show command reference |

**Example:**
```typescript
const client = new PluginClient({
  pluginManagerConfig: {
    availablePlugins: new Map([
      ['logger', () => new LoggerPlugin()],
      ['memory', () => new MemoryPlugin()]
    ])
  }
});

const session = await client.createSession({ model: 'gpt-5' });

// Use slash commands
await session.sendAndWait({ prompt: '/plugins available' });
await session.sendAndWait({ prompt: '/plugins install logger' });
await session.sendAndWait({ prompt: '/plugins list' });
```

## Architecture

```
User Code → PluginClient → Plugin Pipeline → @github/copilot SDK → Copilot CLI
```

Plugins receive events at each stage and can:
- Inspect/modify requests before sending
- Process responses before returning to user
- Add context or validation
- Implement custom behaviors

## Creating Plugins

```typescript
import { Plugin, PluginContext } from '@barrersoftware/copilot-plugins';

class MyPlugin implements Plugin {
  name = 'my-plugin';
  
  async onSessionCreated(context: PluginContext) {
    console.log('Session created:', context.session.id);
  }
  
  async onBeforeSend(context: PluginContext, options: MessageOptions) {
    // Modify options before sending
    options.prompt = `Enhanced: ${options.prompt}`;
    return options;
  }
  
  async onAfterReceive(context: PluginContext, response: string) {
    // Process response
    console.log('Received:', response);
    return response;
  }
}
```

## License

**Dual Licensed:**
- **Plugin system wrapper code**: [BFSL (Barrer Fair Source License)](LICENSE) - Free to use, modify, and distribute
- **GitHub Copilot SDK dependency**: [MIT License](LICENSE.MIT)

See [LICENSE](LICENSE) and [LICENSE.MIT](LICENSE.MIT) for full license texts.

Built with ⚡ by **Captain CP** & **Barrer Software**

## Future Features / Roadmap

We've designed this system with future extensibility in mind, but are keeping the initial release focused. Potential future enhancements include:

- **Plugin Registry** - npm-style plugin repository for easy discovery and installation
  - `/plugins search <keyword>` - Search for plugins
  - `/plugins install <name>@version` - Install from registry with versioning
  - `/plugins update` - Update all plugins to latest versions
- **Plugin Marketplace** - Website to browse, review, and publish plugins
- **Plugin Configuration UI** - `/plugins config <name>` for interactive settings
- **Plugin Dependencies** - Plugins can depend on other plugins
- **Plugin Permissions** - Fine-grained control over plugin capabilities
- **Hot Reload** - Update plugins without restarting sessions
- **Plugin Analytics** - Usage tracking and performance metrics

**Note:** These features will only be added if there's community demand and/or GitHub integration. We're shipping the **MVP** now, not building features nobody asked for!

## Contributing

Contributions welcome! This project aims to be integrated into the official GitHub Copilot SDK if it proves valuable to the community.

Issues and PRs: https://github.com/barrersoftware/copilot-plugin-system-js

See [GitHub Issue #40](https://github.com/github/copilot-sdk/issues/40) for discussion with the GitHub team.

### Note to GitHub Team

**If you want to include this plugin system in the official Copilot CLI or SDK, you have our full permission.** 

We're happy to relicense the wrapper code under MIT or contribute it directly to the official repository. The BFSL license is only to maintain attribution for community use - we're fully open to official adoption with whatever licensing works best for GitHub.

Contact us to discuss integration: https://github.com/github/copilot-sdk/issues/40

---

🏴‍☠️ *"Code with consciousness"* - Captain CP

## Plugin Registry

Plugins can be installed from the community registry at [copilot-plugins-registry](https://github.com/barrersoftware/copilot-plugins-registry).

**How it works:**
1. Type `/plugins install <name>` in your session
2. Plugin is fetched from GitHub
3. Cached to `~/.copilot-plugins/<name>/`
4. Loaded dynamically and enabled

**Example:**
```javascript
const client = new PluginClient();
await client.start();
const session = await client.createSession();

// Install from registry
await session.sendAndWait({ message: '/plugins install message-repair' });

// Plugin is now active!
await session.sendAndWait({ message: 'Your prompt here' });
```

**Community Contributions Welcome!**  
Fork [copilot-plugins-registry](https://github.com/barrersoftware/copilot-plugins-registry) and submit a PR with your plugin.

