# Select-and-go practice review

Owner request: choose study settings and start; an approval step and separate Draft preview mode are not required.

A fresh independent reviewer inspected the diff against `0548f18d67a15b77ce2fbedef492e2fa1d81d13f`. No critical functional findings in practice availability, quarantine filtering, transaction checks or legacy preview scoring. One P2 copy issue called newly due draft questions “approved”; corrected to “questions”. Related library copy now refers to source quarantine instead of local review.

`classifyQuestion` continues to record factual review truthfully. `isStudyAvailable` permits ordinary practice independently and excludes retired/invalidated revisions. Selection, session creation, personal progress, revision queues, coverage, analytics and history use that rule. No approval metadata or question content was fabricated or changed.

New regression tests first failed for the original gate and extra mode. They now cover fresh Learn/Timed starts, real progress and unchanged review metadata, whole cases, and transaction-level quarantine. Legacy preview sessions remain unscored and backups/session snapshots retain their meaning. Legacy preview links and presets open normal practice.

Browser verification identified a resume race: mounting an unanswered question before loading its saved attempt could change scroll restoration through heading focus. The session and saved attempt are now loaded together before display. The existing saved-reading-position browser regression verifies the correction.

The browser suite also exposed a device-report autosave race: stale incoming snapshots could replace the latest typed value. A new actual-IndexedDB regression first reproduced that loss, then exercised out-of-order check changes and a later external restore. The component keeps the normalized expected local value until acknowledged and reevaluates when writes finish, while subsequently accepting restored reports. The independent reviewer rechecked these follow-ups, found no critical/important issue, and reran the focused autosave regression successfully.
