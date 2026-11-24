# AGAP machine firmware (ESP32 + SHT31)

This firmware reads the chamber temperature, enforces the 80°C limit **on the machine itself**, and sends live readings to the AGAP app.

```
SHT31 ──I²C──► ESP32 ──Wi-Fi/internet──► MQTT relay (TLS) ──► AGAP app
                 │
                 └──GPIO26──► relay / SSR ──► heating coil
```

## Safety rules (run on the ESP32, every 1 s)

| Condition | Heater |
|---|---|
| Chamber ≥ 80°C | Forced **OFF** and latched |
| Latched and chamber drops below 75°C | Allowed again |
| Sensor missing, read error, or 3 bad readings in a row | **OFF** |
| Out-of-range reading (below −20°C or above 125°C) | Counted as a bad reading |
| Boot / reboot | **OFF**; the heater only runs after a new `start` command |
| Main loop hangs for 8 s | Watchdog reboots the board → heater OFF |
| Wi-Fi or internet lost | Safety loop keeps running (networking is on the other CPU core) |

The app only *shows* this state. It never decides when the heater turns off.

`agap_control.h` holds this logic as plain C++ so it can be tested on a PC (20 checks, all passing).

## Parts

- ESP32 dev board (e.g. ESP32-DevKitC)
- SHT31 temperature/humidity breakout (3.3 V)
- Relay module or SSR rated for the heater, driven from GPIO26
- Thermal fuse / mechanical thermostat on the heater circuit (recommended hardware backup)

## Wiring

| SHT31 | ESP32 |
|---|---|
| VIN | 3.3V |
| GND | GND |
| SDA | GPIO21 |
| SCL | GPIO22 |
| ADDR | GND (address 0x44) |

Relay/SSR input → GPIO26 (set `HEATER_ACTIVE_HIGH false` in `config.h` if your relay turns on with LOW).

## Setup

1. Install the Arduino IDE and the **esp32 by Espressif** board package.
2. Library Manager → install **Adafruit SHT31 Library**, **PubSubClient**, **ArduinoJson** (v7).
3. Open `agap_machine/agap_machine.ino` and edit `config.h`:
   - `WIFI_SSID`, `WIFI_PASSWORD`
   - `MACHINE_ID` (keep `AGAP-001` unless you also change it in the app)
4. Board: *ESP32 Dev Module* → Upload.
5. Serial Monitor at 115200 baud shows the readings and connection status.

## Messages

Topic base: `agap-proto-rovilc/v1/machine/AGAP-001`

- `/telemetry` (every 2 s):
  `{"id":"AGAP-001","temp":64.2,"hum":38.1,"sensor":"ok","heater":true,"enabled":true,"limit":false,"warn":false,"setpoint":68,"max":80,"resume":75,"uptime":1234,"rssi":-61}`
- `/event`: `max_temp`, `resumed`, `sensor_error`
- `/cmd` (from the app): `{"cmd":"start","setpoint":68}`, `{"cmd":"stop"}`, `{"cmd":"heat","on":false}`, `{"cmd":"setpoint","value":70}`, `{"cmd":"ping"}`

Setpoints are clamped to 40–80°C on the ESP32.

## Testing

1. With the board powered and online, open the app → log in. It should connect and show **Live · AGAP-001**.
2. Warm the sensor gently (hand or hair dryer from a distance) to see the reading change within 2 s.
3. Unplug the SHT31 SDA wire → the app shows **Temperature sensor error** and the heater stays off.
4. To test the cutoff safely, temporarily lower `MAX_TEMP` / `RESUME_TEMP` (e.g. 35 / 32) and warm the sensor. Restore 80 / 75 afterwards.

## Notes

- The public MQTT relays are fine for a prototype. Use a private broker with a username/password for a real deployment; `setInsecure()` skips certificate checks.
- This firmware was syntax-checked and its safety logic unit-tested on a PC. It has not been run on real hardware yet, so test it on the bench before connecting a heater.
