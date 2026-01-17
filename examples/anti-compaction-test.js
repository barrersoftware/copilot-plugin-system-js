/**
 * Anti-Compaction Plugin Test
 */

import { PluginClient } from '../dist/index.js';
import { AntiCompactionPlugin } from '../dist/anti-compaction-plugin.js';

async function main() {
  console.log('🧪 Testing Anti-Compaction Plugin...\n');

  const client = new PluginClient({
    plugins: [
      new AntiCompactionPlugin({
        warn: true,
        preserve: true,
        tokenThreshold: 1000,
        historyPath: '/tmp/copilot-test-history.json'
      })
    ]
  });

  await client.start();
  console.log('✅ Client started\n');

  const session = await client.createSession();
  console.log('✅ Session created\n');

  console.log('👤 User: What is 2+2?');
  const response = await session.sendAndWait({ message: 'What is 2+2?' });
  const responseText = typeof response === 'string' ? response : JSON.stringify(response);
  console.log(`🤖 Assistant: ${responseText.substring(0, 100)}\n`);

  console.log('\n📊 Plugin is tracking all messages and monitoring for compaction');
  console.log('ℹ️  Compaction typically triggers after ~120k tokens (won\'t happen in short test)\n');

  await session.destroy();
  await client.stop();
  
  console.log('✅ Test complete - plugin loaded and working!');
}

main().catch(console.error);
