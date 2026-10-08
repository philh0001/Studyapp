# Physical-phone acceptance checklist

Automated phone-sized Chromium and WebKit tests exercise browser behaviour. They do not prove that the owner’s physical iPhone can install, retain storage, restore downloaded files, or provide a usable screen-reader experience. No physical device was tested remotely.

Use Settings → Your real-phone checks to record only checks performed on an actual device. Checklist records are browser-local and separate from progress backups.

1. Open the published HTTPS site in Safari, add it to the home screen, and launch the installed app.
2. Open a practice session while online. Turn off Wi-Fi and mobile data, close/reopen the installed app, and answer another question offline.
3. Close/reopen again. Confirm the saved answer, session position and preferences remain.
4. Export a progress backup to Files. Change a harmless preference, import the saved file, download the recovery backup, and confirm restoration. Check saved sessions and preferences.
5. Increase system/browser text size, test the smallest supported viewport without horizontal scrolling, and use VoiceOver to navigate answer controls, exhibits, feedback and official-source links.

Record the device model, operating-system version, browser version, date and any failures alongside release verification. Checking an item is a user assertion; the app cannot independently verify physical-device success. Reset the checks after switching devices or clearing browser data.

## Automated WebKit prerequisites

The Playwright `mobile-webkit` project uses the iPhone 13 device profile. Browser binaries can be installed in a writable cache with `PLAYWRIGHT_BROWSERS_PATH=/tmp/studyapp-playwright npx playwright install webkit`. Linux shared-library prerequisites may additionally require administrator-installed packages (`npx playwright install-deps webkit`). Always report failed prerequisites or skipped tests explicitly.

The managed environment has no sudo/root package installation. WebKit 27.2 was downloaded into `/tmp/studyapp-playwright`, and missing Debian 13 libraries were retrieved over the configured proxy and extracted into `/tmp/studyapp-webkit-libs/extracted`. The library files were linked into the downloaded browser’s private `sys/lib` folders. A headless WebKit page successfully rendered and returned `WebKit ready`; this proves browser prerequisites work, not application acceptance.

Run the application suite with:

```sh
XDG_CACHE_HOME=/tmp/studyapp-font-cache \
LD_LIBRARY_PATH=/tmp/studyapp-webkit-libs/extracted/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 \
PLAYWRIGHT_BROWSERS_PATH=/tmp/studyapp-playwright \
npx playwright test --project=mobile-webkit
```

The host-requirement check uses the system `ldconfig` cache, which cannot discover the private GLES library; skipping that check is required for this extracted-library setup. Browser IPC and local server sockets require the execution environment’s network-enabled permissions. The integrated application suite subsequently passed in this environment, including mobile WebKit offline, backup, keyboard, large-text, strict-CSP and advanced-format flows. Exact counts are recorded in the dated improvement release report.
