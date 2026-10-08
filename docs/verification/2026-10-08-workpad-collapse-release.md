# Personal reasoning workpad collapse

Owner asked for Personal reasoning workpad to be collapsible like notes. The editor already used a closed-by-default native details container, but its visible summary was labelled My reasoning and notes and the Personal reasoning workpad heading appeared inside the expanded content. The title itself now sits in the summary as the tap-to-expand/collapse row, with a native disclosure marker and a minimum 48px touch target. There is no duplicate inner title. All fields remain mounted for load/autosave, existing saved notes remain intact, and newly opened questions start closed.

The focused regression first failed because the Personal reasoning workpad heading was outside the summary. It now asserts title-in-summary, initially hidden fields, folding/reopening while an edit saves, stored note retention and a closed remount. The existing phone workpad acceptance now checks the named workpad is initially closed and can fold immediately after editing, then restore the saved text offline. Final checks/deployment evidence follows below.

`npm run check` passed TypeScript, ESLint, all **469 tests across 94 files**, pack validation and production/PWA build. The focused workpad browser flow passed desktop Chromium, phone Chromium and phone WebKit: **3 passed**, verifying default collapse, tap-to-open/fold, queued autosaving and offline reopening.
