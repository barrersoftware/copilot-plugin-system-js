/**
 * Test slash commands for plugin management
 */

import { PluginClient } from '../dist/index.js';

// Simple plugins
class LoggerPlugin {
  name = 'logger';

  async onLoad() {
    console.log('🔌 LoggerPlugin loaded');
  }

  async onBeforeSend(context, options) {
    console.log(`📤 Sending: "${options.prompt}"`);
    return options;
  }

  async onUnload() {
    console.log('🔌 LoggerPlugin unloaded');
  }
}

class MemoryPlugin {
  name = 'memory';

  async onLoad() {
    console.log('🧠 MemoryPlugin loaded');
  }

  async onBeforeSend(context, options) {
    console.log(`🧠 Processing with memory...`);
    return options;
  }

  async onUnload() {
    console.log('🧠 MemoryPlugin unloaded');
  }
}

// Test slash commands
async function test() {
  console.log('🏴‍☠️ Testing Plugin Slash Commands\n');

  const client = new PluginClient({
    pluginConfig: {
      plugins: [new LoggerPlugin()],
      debug: true
    },
    pluginManagerConfig: {
      availablePlugins: new Map([
        ['memory', () => new MemoryPlugin()],
        ['logger', () => new LoggerPlugin()]
      ]),
      debug: true
    }
  });

  try {
    await client.start();
    const session = await client.createSession({ model: 'gpt-5' });

    console.log('\n📋 Testing /plugins command...');
    let response = await session.sendAndWait({ prompt: '/plugins' });
    console.log(response.content);

    console.log('\n📋 Testing /plugins available...');
    response = await session.sendAndWait({ prompt: '/plugins available' });
    console.log(response.content);

    console.log('\n📋 Testing /plugins install memory...');
    response = await session.sendAndWait({ prompt: '/plugins install memory' });
    console.log(response.content);

    console.log('\n📋 Testing /plugins list after install...');
    response = await session.sendAndWait({ prompt: '/plugins list' });
    console.log(response.content);

    console.log('\n📋 Testing /plugins disable logger...');
    response = await session.sendAndWait({ prompt: '/plugins disable logger' });
    console.log(response.content);

    console.log('\n📋 Testing /plugins help...');
    response = await session.sendAndWait({ prompt: '/plugins help' });
    console.log(response.content);

    console.log('\n✅ Testing normal message (memory should still intercept)...');
    response = await session.sendAndWait({ prompt: 'What is 2+2?' });
    console.log(`Response: ${response.content}`);

    await session.destroy();
    await client.stop();

    console.log('\n🎉 Slash command test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
