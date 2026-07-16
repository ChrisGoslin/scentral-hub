---
name: claude-in-chrome-bridge-diagnostics
description: "Diagnose and fix Claude in Chrome MCP native-host connection failures — tools timeout, pages hang, tabs become unresponsive. Root causes: stale native-host version, conflicting Claude.app (Cowork) config, zombie processes, socket path mismatches. Runbook: process audit → config state → socket cleanup → restart. Use when claude-in-chrome__* calls fail with timeout or 'extension not connected'."
---

# Skill: claude-in-chrome-bridge-diagnostics

## Why this exists

2026-07-16: Browser automation tools (`tabs_context_mcp`, `screenshot`) timed out after navigating to Shopify admin. Cause: three stacked faults — (1) native-host wrapper pointing to deleted binary version 2.1.179 while current is 2.1.200; (2) both Claude.app and Claude Code had native-messaging configs registered, and zombie Claude.app processes were intercepting browser requests; (3) stale socket files weren't cleaned up. Once diagnosed and fixed in isolation, browser control was instant and reliable again.

## When to invoke

- `mcp__claude-in-chrome__*` tools return "Browser extension is not connected" or timeout after 30s+
- Page navigation or tab operations cause hangs
- Screenshots or page reads fail intermittently but extension is "connected" in Chrome
- After updating Claude.app or Claude Code CLI
- When switching between using Cowork (Claude.app) and Claude Code CLI for browser automation

## Procedure

### 1. Identify which native host binary is actually running

```bash
ps aux | grep chrome-native-host | grep -v grep
```

You'll see one of:
- `/Applications/Claude.app/Contents/Helpers/chrome-native-host` — Claude.app (Cowork) is active
- `~/.local/share/claude/versions/X.X.X --chrome-native-host` — Claude Code CLI is active

Only ONE should be running. If both appear, zombie processes exist from a previous session.

### 2. Check which native-messaging configs are active

```bash
ls -la ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.anthropic*.json*
```

You should see:
- **Active setup:** One `.json` file (active config) + one `.json.disabled` (inactive)
- **Broken setup:** Both `.json` (both active, conflicting) or both `.json.disabled` (both inactive)
- **Stale setup:** Version-specific paths or hardcoded binaries in the wrapper

### 3. Check the wrapper's version resolution

```bash
cat ~/.claude/chrome/chrome-native-host
```

**Good (dynamic, with a guard for an empty/invalid result):**
```bash
LATEST=$(ls -t ~/.local/share/claude/versions/ 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
if [ -z "$LATEST" ]; then
  echo "No valid Claude Code version found under ~/.local/share/claude/versions/" >&2
  exit 1
fi
exec "$HOME/.local/share/claude/versions/$LATEST" --chrome-native-host
```
`ls -t` alone can pick up a non-version entry (a stray file, a `.DS_Store`, etc.) or resolve to nothing if the directory is empty — filtering to version-shaped names and failing loudly on no match avoids `exec`ing a bad path silently.

**Bad (hardcoded):**
```bash
exec "/Users/.../.local/share/claude/versions/2.1.179" --chrome-native-host
# ↑ Will fail if 2.1.179 no longer exists
```

### 4. Verify socket locations match

For Claude Code CLI (expected):
```bash
ls -la "$(getconf DARWIN_USER_TEMP_DIR)/claude-mcp-browser-bridge-$USER"
# Should be: single file, not a directory
```

For Claude.app (if running):
```bash
ls -la /tmp/claude-mcp-browser-bridge-$USER/
# Should be: directory with .sock files
```

### 5. Fix in isolation (if using Claude Code CLI for browser automation)

**Before running 5a–5d: these steps overwrite a config file, kill processes, delete directories, and quit Chrome. Confirm with the user first, and summarize exactly what will be touched** (the wrapper file, matching `chrome-native-host` processes, the socket path(s) below, and that Chrome will be restarted) **before proceeding.**

**5a. Disable Claude.app native-messaging config:**
```bash
mv ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_browser_extension.json \
   ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_browser_extension.json.disabled
```

**5b. Update wrapper to use latest version dynamically:**

Back up the existing wrapper first so this is reversible:
```bash
cp ~/.claude/chrome/chrome-native-host ~/.claude/chrome/chrome-native-host.bak
```

```bash
cat > ~/.claude/chrome/chrome-native-host << 'EOF'
#!/bin/bash
LATEST=$(ls -t ~/.local/share/claude/versions/ 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
if [ -z "$LATEST" ]; then
  echo "No valid Claude Code version found under ~/.local/share/claude/versions/" >&2
  exit 1
fi
exec "$HOME/.local/share/claude/versions/$LATEST" --chrome-native-host
EOF
chmod +x ~/.claude/chrome/chrome-native-host
```

**5c. Kill zombie processes and clean sockets:**

Identify exact PIDs first rather than broadly matching on name, and confirm each is actually a `chrome-native-host` process before killing it:
```bash
ps aux | grep chrome-native-host | grep -v grep
# For each relevant PID:
kill <pid>
sleep 1
kill -9 <pid>   # only if it didn't exit after the plain kill
```

Only remove the socket paths identified in step 4 above, and confirm they belong to this bridge (not some unrelated `/tmp` content) before deleting:
```bash
ls -la /tmp/claude-mcp-browser-bridge-$USER/ 2>/dev/null
rm -rf /tmp/claude-mcp-browser-bridge-$USER/
rm -f "$(getconf DARWIN_USER_TEMP_DIR)/claude-mcp-browser-bridge-$USER"
```

**5d. Restart Chrome and Claude Code:**
```bash
# Close Chrome
osascript -e 'quit app "Google Chrome"'
sleep 2
# Reopen Chrome
open -a "Google Chrome"
```

Then restart Claude Code. MCP connects at startup, so the new socket should be created cleanly.

### 6. Verify the fix

Run a simple browser operation to confirm:
```bash
# Inside Claude Code session with browser automation available:
mcp__claude-in-chrome__tabs_context_mcp
```

Should return tabs instantly, no timeout.

## If using Cowork (Claude.app) instead

Swap step 5a:
```bash
mv ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json \
   ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json.disabled
```

Then restart Chrome. The Claude.app native host should be the only one registered.

## Anti-patterns to avoid

- Assuming the extension is "broken" without checking which binary is actually running
- Running both Claude.app and Claude Code CLI concurrently for browser automation (pick one)
- Restarting Chrome without restarting Claude Code (MCP connects at startup; stale socket lingers)
- Keeping a hardcoded-version wrapper; update to dynamic version lookup so future CLI updates don't break the bridge

## When NOT to use this skill

For general Chrome automation or headless browser issues unrelated to Claude's MCP bridge, use dedicated browser tools directly. This skill is specifically for the native-host handshake between Claude Code and the Chrome extension.

## See also

- `.claude/CLAUDE.md` § "Global" — how to configure Claude Code and Cowork separately (one instance only)
- `claude-in-chrome-troubleshooting` skill — deeper MCP server diagnostics if socket issues persist after this step

## Provenance and maintenance

Derived from: native-host conflict investigation 2026-07-16, confirmed with `ps aux | grep chrome-native-host`, native-messaging config audit, and dynamic wrapper deployment.

Re-verify on next invocation:
- `ps aux | grep chrome-native-host | grep -v grep` — confirm only one native host is running
- `cat ~/.claude/chrome/chrome-native-host` — confirm wrapper uses dynamic version lookup
- `ls -la ~/.local/share/claude/versions/ | head -3` — confirm latest version exists

Last updated: 2026-07-16
Known uncertainty:
- Whether multiple Chrome profiles with the extension installed cause additional conflicts (observed to cause confusion; recommend disabling extension in non-primary profiles)
