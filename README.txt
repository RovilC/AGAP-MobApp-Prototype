AGAP – Interactive HTML Prototype
===========================================

LIVE LINKS (GitHub Pages)
  App (tester's phone):              https://rovilc.github.io/AGAP-MobApp-Prototype/
  Remote controller (your device):   https://rovilc.github.io/AGAP-MobApp-Prototype/controller.html

OPEN OFFLINE
  Unzip and double-click index.html (Chrome or Edge). Offline, there is no live machine,
  so switch the temperature source to "Simulated" in the facilitator panel.

DEMO ACCOUNT
  Username: MangJun    PIN: 123456
  Or tap "Create account" (username, numero ng telepono, samahan, 6-digit PIN typed twice).

LANGUAGE
  Screens are in Tagalog. Buttons and short replies are in English (Yes, No, Confirm, Start, Stop...).
  Technical words stay in English (Temperature, Heater, Sensor, Wi-Fi).

FLOW
  Choose demo -> Log in -> "Kumonekta sa makina" (choose Wi-Fi or Bluetooth, select AGAP-001, tap CONNECT)
  -> "Kumokonekta…" (checks internet, machine and temperature sensor) -> Home.
  This happens on every login, and it always connects. If the ESP32 is sending data the
  temperature is live; if not, the app continues with a simulated reading labelled "SIMULATED"
  and switches to live by itself as soon as the machine's data arrives.

CHAMBER TEMPERATURE (live)
  The Home and Monitor screens show the real chamber temperature from the machine's SHT31 sensor.
  Path: SHT31 -> ESP32 -> Wi-Fi/internet -> MQTT relay -> app (updates every 2 seconds).
  - 75°C or more: yellow "near limit" warning + alert.
  - 80°C: the ESP32 turns the heater OFF by itself (red alert). It turns back on below 75°C.
  - Sensor fault: the app shows the error and the machine keeps its heater off.
  - No live data for 10 s: the app says so and continues with the labelled simulated reading.
  Humidity and weight are still simulated in this prototype.

TEMPERATURE SOURCE (facilitator only)
  Live (default): real readings from the ESP32. Needs the firmware in /firmware flashed and online.
  Simulated: for testing without a machine. Clearly labelled "SIMULATED (pang-test)" on screen.
  "Simulate overheat" pushes the simulated chamber to 80°C to test the cutoff alerts.

ALERTS
  Unread critical = red, unread "needs attention" = yellow, unread info = blue.
  Opened alerts return to the normal white style.

FACILITATOR CONTROLS
  Hidden panel: long-press the logo, or press ` / F2 on a keyboard.
  Remote: open controller.html on another device and enter the 4-digit code shown on the app's
  first screen. You can trigger power cuts, switch the temperature source, change the clock speed,
  jump to any screen, and act as "Ate Lita" in the Shared Batch demo.

DEMO MODES
  Original flow – one phone, one machine.
  Shared batch – several phones share one machine (setup lock, who started it, etc.).

RESET
  Facilitator panel -> Reset demo (tap twice). Data is kept in the browser until reset.

MACHINE FIRMWARE
  See firmware/README.md.
