AGAP – Interactive HTML Prototype
=================================

HOW TO OPEN
  1. Unzip the folder.
  2. Double-click index.html (Chrome or Edge recommended). No internet or installation needed.
  On a laptop it shows inside a phone frame. On a phone (if you copy the folder there) it fills the screen.

CHOOSE A DEMO (first screen)
  • Orihinal na daloy – one phone: Start → Login → Connect (Wi-Fi first, Bluetooth fallback) → Dashboard →
    Bagong Batch → Subaybayan → power cut → biomass → Tuyo na → Rekord.
  • Shared Batch – several phones on one machine (SUBAD / AGAP-001): operator name, setup lock,
    and actions by "Ate Lita" from another phone (triggered from the facilitator panel).

LOGIN
  Samahan: SUBAD   PIN: 123456
  (Tapping "Tapos" on an empty keypad fills the demo PIN, as in Figma. 3 wrong PINs = 1-minute lock.)

FACILITATOR PANEL (hidden from testers)
  Open it by: long-pressing any AGAP logo, OR pressing ` (backtick) / F2, OR tapping the clock 3 times,
  OR hovering the right edge of the window.
  From there you can:
    – Trigger a power cut (shows an Android-style notification the tester must interpret), restore power,
      low battery, biomass temperature drop, overheating, door open, machine problem, emergency stop,
      lost connection, session expired, insufficient power, rainy weather.
    – Change the drying-clock speed (Figma ~50 s, ~3 min [default], ~8 min, ~20 min, real 6 h 20 min),
      skip +1 hour, or finish the batch immediately.
    – Shared Batch: simulate Ate Lita locking setup, starting/stopping a batch, removing fish,
      answering the power-cut question, race conditions, setup timeout, sync failure, offline records.
    – Jump to any screen, switch scenario, or RESET THE DEMO (do this between testers).
  Figma's hidden hotspot is kept: the top-right corner of the Dashboard while a batch is running = instant power cut.

KEYBOARD SHORTCUTS (same keys as the Figma prototype)
  Esc back · H overheat · D door open · E machine problem / weighing error · L connection lost ·
  X session expired · A batch already running · V invalid values · F next start fails ·
  R records not found · N no new notifications · P allow notifications

NOTES
  • The app remembers progress in the browser (login with "Tandaan ako", batches, records, settings).
    Use "I-reset ang demo" in the facilitator panel to start fresh.
  • Sound/vibration for notifications can be turned off in Higit pa → Mga Ayos.
