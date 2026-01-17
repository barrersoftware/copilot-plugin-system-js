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
import { PluginClient } from '@barrersoftware/copilot-plugins';

// Create client with plugins
const client = new PluginClient({
  pluginConfig: {
    plugins: [new MemoryPlugin(), new TrustFrameworkPlugin()]
  }
});

// Use just like the regular SDK
const session = await client.createSession({ model: 'gpt-5' });
const response = await session.sendAndWait({ prompt: 'Hello!' });
```

## Slash Command Support 🏴‍☠️

Manage plugins conversationally with built-in slash commands:

```bash
/plugins                    # List installed plugins
/plugins available          # Browse available plugins
/plugins install logger     # Install a plugin at runtime
/plugins enable memory      # Enable a disabled plugin
/plugins disable trust      # Disable a plugin
/plugins uninstall logger   # Uninstall a plugin
/plugins help              # Show command reference
```

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
