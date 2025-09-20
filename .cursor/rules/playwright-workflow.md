### Playwright MCP UI Smoke Workflow

- **baseUrl**: `https://localhost`
- **loginPath**: `/login`
- **credentials**:
  - **username**: `ali`
  - **password**: `1234`
- **security**:
  - **bypassCertWarning**: true (Chrome privacy error → Advanced → Proceed)
- **timeouts**:
  - **navigation**: 15s
  - **element**: 5s
- **screenshotsDir**: `.playwright-mcp`

#### Steps

1. Navigate to `${baseUrl}${loginPath}`.
2. If privacy error appears, click `Advanced` → `Proceed to localhost (unsafe)`.
3. Fill login form:
   - `textbox[name="نام کاربری"]` → username
   - `textbox[name="رمز عبور"]` → password
   - Check `checkbox[name="مرا به خاطر بسپار"]`.
4. Click `button[name="ورود"]`.
5. Wait for dashboard text `داشبورد` and URL to contain `/live`.
6. Screenshot pages:
   - `login-filled.png`, `dashboard.png` (full page).
7. Sanity nav:
   - Open `اشخاص` → screenshot `people.png`.
   - Open `دوربین ها` → screenshot `cameras.png`.
   - If sidebar items are off-viewport, programmatically `scrollIntoView` then `click()`.

#### Reusable Prompt Snippet

```
Use the Playwright MCP to:
- open https://localhost/login
- bypass the TLS interstitial if shown
- login with ali / 1234, remember me checked
- verify dashboard (text: داشبورد) and take full-page screenshot to .playwright-mcp/dashboard.png
- visit اشخاص and دوربین ها pages, saving screenshots to .playwright-mcp/people.png and .playwright-mcp/cameras.png
```
