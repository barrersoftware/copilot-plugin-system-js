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
  plugins: [
    new MemoryPlugin(),
    new TrustFrameworkPlugin()
  ]
});

// Use just like the regular SDK
const session = await client.createSession({ model: 'gpt-5' });
const response = await session.sendAndWait({ prompt: 'Hello!' });
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

MIT - Built on the official GitHub Copilot SDK (also MIT licensed)

## Contributing

See [GitHub Issue #40](https://github.com/github/copilot-sdk/issues/40) for discussion with the GitHub team.
