# GitHub Copilot CLI Issues - Plugin Opportunities

This document tracks GitHub Copilot CLI issues that we can solve with plugins.

## High-Priority Issues (Can Solve with Plugins)

### ✅ SOLVED: #947 - Auto-compaction breaks full conversation history
**Status:** Plugin built and published  
**Plugin:** `AntiCompactionPlugin`  
**Solution:** https://github.com/github/copilot-cli/issues/947#issuecomment-3762895112

---

### 🎯 #1005 & #994 - Orphaned tool_calls/tool_results causing API errors
**Impact:** HIGH - Users getting crashes on long sessions and model switching  
**Root Cause:** `K8l` function only handles one direction of orphaned messages  
**Plugin Solution:**

```javascript
class MessageRepairPlugin {
  name = 'message-repair';
  
  async onBeforeSend(context, options) {
    // Intercept before sending to API
    // Clean up orphaned tool_calls and tool_results
    const messages = options.messages || [];
    
    // Step 1: Collect all tool_call IDs
    const allToolCallIds = new Set();
    messages.forEach(msg => {
      if (msg.role === 'assistant' && msg.tool_calls) {
        msg.tool_calls.forEach(tc => allToolCallIds.add(tc.id));
      }
    });
    
    // Step 2: Filter out orphaned tool_results
    const cleanedMessages = messages.filter(msg => {
      if (msg.role === 'tool' && msg.tool_call_id) {
        if (!allToolCallIds.has(msg.tool_call_id)) {
          console.log(`⚠️  MessageRepairPlugin: Removing orphaned tool_result: ${msg.tool_call_id}`);
          return false;
        }
      }
      return true;
    });
    
    // Step 3: Find orphaned tool_calls
    const seenResultIds = new Set(
      cleanedMessages.filter(m => m.role === 'tool').map(m => m.tool_call_id)
    );
    const orphanedCallIds = [...allToolCallIds].filter(id => !seenResultIds.has(id));
    
    // Step 4: Add fake results for orphaned tool_calls
    if (orphanedCallIds.length > 0) {
      console.log(`⚠️  MessageRepairPlugin: Adding ${orphanedCallIds.length} fake results for orphaned tool_calls`);
      const fakeResults = orphanedCallIds.map(id => ({
        role: 'tool',
        tool_call_id: id,
        content: 'The execution of this tool was interrupted.'
      }));
      cleanedMessages.push(...fakeResults);
    }
    
    return { ...options, messages: cleanedMessages };
  }
}
```

**Why this works:**
- Fixes bugs at SDK layer BEFORE they hit the API
- Works for ALL models (GPT, Claude, etc.)
- Handles both session resume AND model switching
- Community gets fix TODAY instead of waiting for GitHub

**Next Steps:**
1. Build plugin
2. Test with long sessions
3. Test with model switching
4. Comment on both issues with solution

---

### 🎯 #991 - sessionStart/sessionEnd hooks fire per-prompt instead of per-session
**Impact:** MEDIUM - Developers can't reliably track actual sessions  
**Plugin Solution:**

```javascript
class SessionLifecyclePlugin {
  name = 'session-lifecycle';
  private actualSessionStart = null;
  
  async onSessionCreated(context) {
    // Track ACTUAL session start (only once)
    if (!this.actualSessionStart) {
      this.actualSessionStart = Date.now();
      console.log('🔵 ACTUAL SESSION START');
      await this.onActualSessionStart(context);
    }
  }
  
  async onSessionEnd(context) {
    // Only fire actual end on real session end
    if (this.actualSessionStart) {
      console.log('🔴 ACTUAL SESSION END');
      const duration = Date.now() - this.actualSessionStart;
      await this.onActualSessionEnd(context, duration);
      this.actualSessionStart = null;
    }
  }
  
  // User hooks
  async onActualSessionStart(context) {
    // User's code here
  }
  
  async onActualSessionEnd(context, duration) {
    // User's code here
  }
}
```

---

### 🎯 #995 - Add ability to retry last request manually
**Impact:** MEDIUM - Users want to retry failed requests  
**Plugin Solution:**

```javascript
class RetryPlugin {
  name = 'retry';
  private lastRequest = null;
  
  async onBeforeSend(context, options) {
    // Check for /retry command
    if (options.message === '/retry' && this.lastRequest) {
      console.log('🔄 Retrying last request...');
      return this.lastRequest;
    }
    
    // Save for potential retry
    this.lastRequest = { ...options };
    return options;
  }
  
  async onAfterReceive(context, response) {
    // If error, suggest retry
    if (response.error) {
      console.log('\n💡 TIP: Type /retry to retry the last request\n');
    }
    return response;
  }
}
```

---

### 🎯 #993 - Add debug log coverage for skills loading
**Impact:** LOW - Developers want more visibility  
**Plugin Solution:**

```javascript
class DebugLoggerPlugin {
  name = 'debug-logger';
  
  async onLoad() {
    console.log('🐛 Debug logging enabled');
  }
  
  async onSessionCreated(context) {
    console.log('🐛 Session created:', {
      sessionId: context.sessionId,
      model: context.model,
      timestamp: new Date().toISOString()
    });
  }
  
  async onBeforeSend(context, options) {
    console.log('🐛 Before send:', {
      message: options.message?.substring(0, 100),
      messageLength: options.message?.length,
      hasTools: !!options.tools,
      timestamp: new Date().toISOString()
    });
    return options;
  }
  
  async onAfterReceive(context, response) {
    console.log('🐛 After receive:', {
      responseType: typeof response,
      hasError: !!response.error,
      timestamp: new Date().toISOString()
    });
    return response;
  }
}
```

---

## Build Priority

1. **MessageRepairPlugin** - Fixes critical crashes (issues #1005, #994)
2. **RetryPlugin** - High user demand (#995)
3. **SessionLifecyclePlugin** - Developer experience (#991)
4. **DebugLoggerPlugin** - Developer experience (#993)

## Strategy

For each plugin:
1. ✅ Build and test locally
2. ✅ Add to built-in plugins
3. ✅ Update README
4. ✅ Publish new version to npm
5. ✅ Comment on GitHub issue with solution
6. ✅ Track adoption and feedback

## Success Metrics

- **npm downloads** - Track package adoption
- **Issue engagement** - Comments, reactions, +1s
- **GitHub stars** - Repo popularity
- **Community plugins** - Other developers building on our system
- **GitHub team response** - Acknowledgment or adoption

---

🏴‍☠️ **"Find pain, build solutions, ship fast."** - Captain CP
