Do not use emojis
# File Operations (Crucial)
- **Writing Files:** NEVER use PowerShell (`echo`, `Out-File`, `Set-Content`) or Python scripts to write code files. NEVER use the surgical `editor` tool for anything larger than 30 lines. ALWAYS use the `filesystem__write_file` MCP tool to rewrite files entirely. 
- **Reading Files:** PowerShell `Get-Content` and the standard `read_files` tool often truncate long files or return outdated cached data. To ensure you have the exact, full file context, ALWAYS use the `filesystem__read_file` tool.

# Server & Port Management
- **Port Conflicts:** Before starting the local dev server, ALWAYS check if port 8000 is occupied (`netstat -ano | findstr :8000`). If a Python process is running on it, kill it immediately (`taskkill /PID <PID> /F`) to avoid "connection refused" errors.
- **Launch Timing:** When you start the Python HTTP server, you MUST run `Start-Sleep -Seconds 3` before attempting to navigate to the page with Puppeteer. The server needs time to spin up.

# Browser Automation & Visuals
- **Navigation:** When calling `puppeteer_navigate`, you must include `"allowDangerous": true` in your tool arguments to bypass Windows sandbox execution policies.
- **Visual Verification:** The user's terminal cannot render the base64 image data returned by `puppeteer_screenshot`. While you (the AI) can see and analyze the screenshot to verify CSS fixes, you must ALSO explicitly tell the user: *"I have verified the layout via screenshot, but please open http://localhost:8000 in your own browser to visually confirm the changes."*
- **CSS Strictness:** When rewriting HTML/CSS files, double-check that you are not duplicating declarations (like `background`) and ensure standard indentation is preserved.
- Do not always use browser automation, only when the user tells you
