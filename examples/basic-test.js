/**
 * Basic test of the plugin system
 */

import { PluginClient } from '../dist/index.js';

// Simple logging plugin
class LoggerPlugin {
  name = 'logger';

  async onLoad() {
    console.log('🔌 LoggerPlugin loaded');
  }

  async onSessionCreated(context) {
    console.log(`📝 Session created: ${context.session.sessionId}`);
  }

  async onBeforeSend(context, options) {
    console.log(`📤 Sending: "${options.prompt}"`);
    return options;
  }

  async onAfterReceive(context, response) {
    console.log(`📥 Received response (${response?.data?.content?.length || 0} chars)`);
    return response;
  }

  async onSessionEnd(context) {
    console.log('🏁 Session ended');
  }

  async onUnload() {
    console.log('🔌 LoggerPlugin unloaded');
  }
}

// Test the plugin system
async function test() {
  console.log('🏴‍☠️ Testing GitHub Copilot Plugin System\n');

  const client = new PluginClient({
    pluginConfig: {
      plugins: [new LoggerPlugin()],
      debug: true
    }
  });

  try {
    console.log('Starting client...');
    await client.start();

    console.log('\nCreating session...');
    const session = await client.createSession({ model: 'gpt-5' });

    console.log('\nSending test message...');
    const response = await session.sendAndWait({ prompt: 'What is 2+2? Answer in one word.' });

    console.log(`\n✅ Response: ${response?.data?.content}`);

    console.log('\nCleaning up...');
    await session.destroy();
    await client.stop();

    console.log('\n🎉 Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
