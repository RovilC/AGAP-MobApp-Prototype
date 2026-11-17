AGAP – Interactive HTML Prototype
=================================

LIVE LINKS (after GitHub Pages is on)
  App (give this to the tester's phone):  https://rovilc.github.io/AGAP-MobApp-Prototype/
  Remote controller (your own device):    https://rovilc.github.io/AGAP-MobApp-Prototype/controller.html

OPEN OFFLINE
  Unzip and double-click index.html (Chrome or Edge). Remote control needs internet, so it won't work offline.

DEMO ACCOUNT
  Username: MangJun    PIN: 123456
  Or tap "Gumawa ng account" to create one (username, phone number, Samahan, 6-digit PIN typed twice).
  The PIN uses the phone's own number keyboard. 3 wrong tries = 1-minute lock.

CHOOSE A DEMO (first screen)
  • Orihinal na daloy – one phone.
  • Shared Batch – several phones on one machine. Uses the same screens as the original flow, plus
    "who started it" / setup-lock info and actions from "Ate Lita" on another phone.

DRYING CLOCK
  A whole batch (6 h 20 min) runs in about 30 seconds by default. You can change it in the facilitator panel or the controller.

POWER CUT FLOW
  Power cut → notification → "Ano ang susunod?" → "Ipagpapatuloy ba ang pagpapatuyo?"
    • HINDI, ITIGIL → the batch stops and the app opens Rekord, with the stopped batch on top.
    • OO, ITULOY → choose Araw (Solar) or Biomass → setup checklist. The start button stays locked until every item is ticked.
  When power comes back, the app asks whether to switch back to electric heating.

REMOTE CONTROL (trigger events from your own phone or laptop)
  1. Open the app on the tester's phone. The first screen shows "Remote code: 1234 · handa". The code is also in the facilitator panel.
  2. On your own device, open controller.html, type the code, and tap "Ikonekta".
  3. The controller shows the tester's current screen, batch % and power. Its buttons trigger the power cut, low battery,
     temperature drop, overheating, door open and other events, plus Ate Lita's actions, clock speed, jump to screen and reset.
  Both devices need internet. Messages go through a free public relay (no account needed). They carry only demo commands,
  no personal data. If the venue Wi-Fi blocks it, try mobile data.

FACILITATOR PANEL (on the tester's phone)
  Long-press any AGAP logo, tap the clock 3 times, or press ` / F2 on a laptop.

KEYBOARD SHORTCUTS (laptop, same as Figma)
  Esc back · H overheat · D door open · E machine problem · L connection lost · X session expired ·
  A batch already running · V invalid values · F next start fails · R records not found · N no new notifications · P allow notifications

TIP: Use "I-reset ang demo" between testers. The remote code stays the same after a reset.
