/**
 * Test built-in plugins via slash commands
 */

import { PluginClient } from '../dist/index.js';

async function test() {
  console.log('🏴‍☠️ Testing Built-in Plugins\n');

  // Create client with NO initial plugins
  // Built-ins are available via /plugins install
  const client = new PluginClient({
    pluginConfig: {
      plugins: [],
      debug: true
    }
    // Built-in plugins are included by default!
  });

  try {
    await client.start();
    const session = await client.createSession({ model: 'gpt-5' });

    console.log('\n📋 Check available built-in plugins:');
    let response = await session.sendAndWait({ prompt: '/plugins available' });
    console.log(response.content);

    console.log('\n📋 Install memory-preservation plugin:');
    response = await session.sendAndWait({ prompt: '/plugins install memory-preservation' });
    console.log(response.content);

    console.log('\n📋 Install logger plugin:');
    response = await session.sendAndWait({ prompt: '/plugins install logger' });
    console.log(response.content);

    console.log('\n📋 Install analytics plugin:');
    response = await session.sendAndWait({ prompt: '/plugins install analytics' });
    console.log(response.content);

    console.log('\n📋 Check installed plugins:');
    response = await session.sendAndWait({ prompt: '/plugins list' });
    console.log(response.content);

    console.log('\n💬 Send test messages (plugins active):');
    await session.sendAndWait({ prompt: 'What is 2+2?' });
    await session.sendAndWait({ prompt: 'Tell me a joke' });

    console.log('\n📋 Disable logger:');
    response = await session.sendAndWait({ prompt: '/plugins disable logger' });
    console.log(response.content);

    console.log('\n💬 Send another message (logger disabled):');
    await session.sendAndWait({ prompt: 'One more message' });

    await session.destroy();
    await client.stop();

    console.log('\n🎉 Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
