// ===== AGAP machine configuration – edit before uploading =====
#pragma once

// Wi-Fi with internet access (venue Wi-Fi or a phone hotspot)
#define WIFI_SSID     "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Machine ID – must match the app (Settings > Connection shows "AGAP-001")
#define MACHINE_ID    "AGAP-001"

// Pins (ESP32 DevKit)
#define PIN_SDA       21      // SHT31 SDA
#define PIN_SCL       22      // SHT31 SCL
#define SHT31_ADDR    0x44    // 0x45 if the ADDR pin is tied high
#define PIN_HEATER    26      // relay / SSR input that switches the heating coil
#define HEATER_ACTIVE_HIGH true   // set false if your relay turns ON with a LOW signal
#define PIN_STATUS_LED 2      // on-board LED: blinks while the heater is on

// Temperature safety (°C) – enforced on the machine itself
#define MAX_TEMP      80.0f   // heater forced OFF at or above this
#define RESUME_TEMP   75.0f   // heater allowed again only below this
#define WARN_TEMP     75.0f   // "near max" warning sent to the app

// Timing
#define READ_INTERVAL_MS   1000   // sensor read + safety check
#define SEND_INTERVAL_MS   2000   // telemetry to the app
#define WATCHDOG_SECONDS   8      // reboot (heater off) if the loop ever hangs

// Relay (same free public broker the app and remote controller use; TLS)
#define MQTT_HOST_1   "broker.emqx.io"
#define MQTT_HOST_2   "broker.hivemq.com"
#define MQTT_PORT     8883
#define TOPIC_BASE    "agap-proto-rovilc/v1/machine/" MACHINE_ID
