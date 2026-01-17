/**
 * Example: Memory preservation plugin using compaction hooks (OPT-IN)
 */

import { PluginClient } from '../dist/index.js';

// Plugin that preserves important data before compaction
class MemoryPreservationPlugin {
  name = 'memory-preservation';
  importantData = [];

  async onLoad() {
    console.log('🧠 MemoryPreservationPlugin loaded');
  }

  async onBeforeSend(context, options) {
    // Track what we send
    if (options.prompt) {
      this.importantData.push({ 
        type: 'user_message',
        content: options.prompt,
        timestamp: new Date().toISOString()
      });
    }
    return options;
  }

  // OPT-IN: Only implement if you care about compaction!
  async onCompactionStart(context, data) {
    console.log('\n⚠️  Context compaction starting!');
    console.log(`   Pre-compaction tokens: ${data.preCompactionTokens}`);
    console.log(`   Messages in context: ${data.preCompactionMessagesLength}`);
    console.log(`   Preserving ${this.importantData.length} important items...`);
    
    // Could save important data to external storage here
    // For example: save to database, file, or plugin context
    context.data.set('preserved_data', [...this.importantData]);
  }

  // OPT-IN: Get compaction results
  async onCompactionComplete(context, data) {
    if (data.success) {
      console.log('\n✅ Compaction successful!');
      console.log(`   Tokens removed: ${data.tokensRemoved}`);
      console.log(`   Messages removed: ${data.messagesRemoved}`);
      console.log(`   Post-compaction tokens: ${data.postCompactionTokens}`);
      if (data.summaryContent) {
        console.log(`   Summary: ${data.summaryContent.substring(0, 100)}...`);
      }
    } else {
      console.error(`❌ Compaction failed: ${data.error}`);
    }
  }
}

// Plugin that DOESN'T care about compaction (no opt-in hooks)
class SimpleLoggerPlugin {
  name = 'logger';

  async onLoad() {
    console.log('📝 SimpleLogger loaded');
  }

  async onBeforeSend(context, options) {
    console.log(`📤 Sending: "${options.prompt}"`);
    return options;
  }

  // No onCompactionStart or onCompactionComplete = no overhead!
}

async function test() {
  console.log('🏴‍☠️ Testing OPT-IN Compaction Hooks\n');

  const client = new PluginClient({
    pluginConfig: {
      plugins: [
        new MemoryPreservationPlugin(), // Opts into compaction events
        new SimpleLoggerPlugin()         // Ignores compaction events
      ],
      debug: true
    }
  });

  try {
    await client.start();
    const session = await client.createSession({ model: 'gpt-5' });

    console.log('\n💬 Sending messages...\n');
    
    await session.sendAndWait({ prompt: 'Hello, this is message 1' });
    await session.sendAndWait({ prompt: 'This is message 2' });
    await session.sendAndWait({ prompt: 'Message 3 here' });
    
    console.log('\n📊 Note: Compaction events fire automatically when context gets too large.');
    console.log('   MemoryPreservationPlugin will be notified (opted in)');
    console.log('   SimpleLoggerPlugin will NOT be notified (did not opt in)\n');

    await session.destroy();
    await client.stop();

    console.log('\n🎉 Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
