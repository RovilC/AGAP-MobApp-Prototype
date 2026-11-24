/*
  AGAP fish dryer – ESP32 machine firmware
  - Reads the chamber temperature (and humidity) from an SHT31 every second
  - Controls the electric heating coil through a relay/SSR
  - Enforces the 80 °C maximum ON THE MACHINE: heater off at 80 °C, back on only below 75 °C,
    heater off on any sensor fault, heater off at boot and if the loop hangs (watchdog)
  - Sends readings to the AGAP app every 2 s through the internet relay (MQTT over TLS)
  - Receives start / stop / setpoint / heat on-off commands from the app

  Libraries (Arduino Library Manager): "Adafruit SHT31 Library", "PubSubClient" (Nick O'Leary), "ArduinoJson" (v7)
  Board: ESP32 Dev Module (Arduino-ESP32 core 2.x or 3.x)
*/
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_SHT31.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <esp_task_wdt.h>
#include "config.h"
#include "agap_control.h"

Adafruit_SHT31 sht31;
WiFiClientSecure tls;
PubSubClient mqtt(tls);
Preferences prefs;

AgapLimits LIM;
AgapState  ST;
float humidity = NAN;
bool  sensorFound = false;
bool  lastHeater = false, lastLatched = false, lastSensorOk = true;
volatile uint8_t pendingEvents = 0;               // set by the safety loop, sent by the network task
enum { EV_MAX = 1, EV_RESUMED = 2, EV_SENSOR = 4 };
unsigned long lastRead = 0, lastSend = 0, lastMqttTry = 0, heaterOnSince = 0;
int   brokerIdx = 0;
char  clientId[40];

const String T_TELEMETRY = String(TOPIC_BASE) + "/telemetry";
const String T_CMD       = String(TOPIC_BASE) + "/cmd";
const String T_EVENT     = String(TOPIC_BASE) + "/event";

void setHeater(bool on) {
  digitalWrite(PIN_HEATER, (on == HEATER_ACTIVE_HIGH) ? HIGH : LOW);
}

void publishEvent(const char *type, const char *text) {
  if (!mqtt.connected()) return;
  JsonDocument d;
  d["id"] = MACHINE_ID; d["type"] = type; d["text"] = text; d["temp"] = ST.sensorOk ? ST.temp : (float)NAN;
  char buf[200]; size_t n = serializeJson(d, buf, sizeof(buf));
  mqtt.publish(T_EVENT.c_str(), (const uint8_t *)buf, n, false);
}

void publishTelemetry() {
  if (!mqtt.connected()) return;
  JsonDocument d;
  d["id"] = MACHINE_ID;
  if (ST.sensorOk) d["temp"] = roundf(ST.temp * 10) / 10.0f; else d["temp"] = nullptr;
  if (!isnan(humidity)) d["hum"] = roundf(humidity * 10) / 10.0f; else d["hum"] = nullptr;
  d["sensor"]   = !sensorFound ? "missing" : (ST.sensorOk ? "ok" : "error");
  d["heater"]   = ST.heaterOn;
  d["enabled"]  = ST.enabled;
  d["limit"]    = ST.limitLatched;           // true = max temp reached, heater locked off
  d["warn"]     = agapWarning(ST, LIM);      // true = at/above WARN_TEMP
  d["setpoint"] = agapClampSetpoint(ST.setpoint);
  d["max"] = LIM.maxTemp; d["resume"] = LIM.resumeTemp;
  d["uptime"] = millis() / 1000; d["rssi"] = WiFi.RSSI();
  char buf[320]; size_t n = serializeJson(d, buf, sizeof(buf));
  mqtt.publish(T_TELEMETRY.c_str(), (const uint8_t *)buf, n, false);
}

void onCommand(char *topic, byte *payload, unsigned int len) {
  JsonDocument d;
  if (deserializeJson(d, payload, len)) return;
  const char *cmd = d["cmd"] | "";
  if (!strcmp(cmd, "start")) {                     // batch started on electric heat
    ST.setpoint = agapClampSetpoint(d["setpoint"] | ST.setpoint);
    ST.enabled = true;
  } else if (!strcmp(cmd, "stop")) {               // batch stopped / finished
    ST.enabled = false;
  } else if (!strcmp(cmd, "heat")) {               // switch electric heating on/off (e.g. biomass or solar mode)
    ST.enabled = d["on"] | false;
  } else if (!strcmp(cmd, "setpoint")) {
    ST.setpoint = agapClampSetpoint(d["value"] | ST.setpoint);
  }
  prefs.putFloat("setpoint", ST.setpoint);         // heating itself is NOT persisted: after a reboot it stays off
  publishTelemetry();                              // immediate acknowledgement (also answers "ping")
}

void ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  static unsigned long lastTry = 0;
  if (millis() - lastTry < 10000 && lastTry) return;
  lastTry = millis();
  WiFi.disconnect(); WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void ensureMqtt() {
  if (WiFi.status() != WL_CONNECTED || mqtt.connected()) return;
  if (millis() - lastMqttTry < 5000 && lastMqttTry) return;
  lastMqttTry = millis();
  const char *host = (brokerIdx % 2 == 0) ? MQTT_HOST_1 : MQTT_HOST_2;
  mqtt.setServer(host, MQTT_PORT);
  if (mqtt.connect(clientId)) {
    mqtt.subscribe(T_CMD.c_str());
    publishEvent("online", "Machine connected");
    publishTelemetry();
  } else {
    brokerIdx++;                                   // try the other broker next time
  }
}

// Network runs on core 0 in its own task, so a slow Wi-Fi/TLS connection can never pause the safety loop.
void netTask(void *) {
  for (;;) {
    ensureWifi();
    ensureMqtt();
    mqtt.loop();
    uint8_t ev = pendingEvents;
    if (ev && mqtt.connected()) {
      pendingEvents &= ~ev;
      if (ev & EV_MAX)     publishEvent("max_temp", "Max temperature reached (80 C). Heater off.");
      if (ev & EV_RESUMED) publishEvent("resumed", "Below 75 C. Heater allowed again.");
      if (ev & EV_SENSOR)  publishEvent("sensor_error", "Temperature sensor error. Heater off.");
    }
    if (millis() - lastSend >= SEND_INTERVAL_MS) { lastSend = millis(); publishTelemetry(); }
    vTaskDelay(pdMS_TO_TICKS(50));
  }
}

void setupWatchdog() {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
  esp_task_wdt_config_t cfg = { .timeout_ms = WATCHDOG_SECONDS * 1000, .idle_core_mask = 0, .trigger_panic = true };
  esp_task_wdt_reconfigure(&cfg);
#else
  esp_task_wdt_init(WATCHDOG_SECONDS, true);
#endif
  esp_task_wdt_add(NULL);
}

void setup() {
  pinMode(PIN_HEATER, OUTPUT); setHeater(false);   // heater OFF before anything else
  pinMode(PIN_STATUS_LED, OUTPUT);
  Serial.begin(115200);
  setupWatchdog();

  LIM.maxTemp = MAX_TEMP; LIM.resumeTemp = RESUME_TEMP; LIM.warnTemp = WARN_TEMP;
  prefs.begin("agap", false);
  ST.setpoint = agapClampSetpoint(prefs.getFloat("setpoint", 68.0f));
  ST.enabled = false;

  Wire.begin(PIN_SDA, PIN_SCL);
  sensorFound = sht31.begin(SHT31_ADDR);
  Serial.println(sensorFound ? "SHT31 found" : "SHT31 NOT FOUND – heater stays off");

  snprintf(clientId, sizeof(clientId), "agap-%s-%06lx", MACHINE_ID, (unsigned long)(esp_random() & 0xFFFFFF));
  WiFi.mode(WIFI_STA); WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  tls.setInsecure();                               // public broker, no secrets are sent
  mqtt.setBufferSize(512); mqtt.setKeepAlive(30); mqtt.setSocketTimeout(5);
  mqtt.setCallback(onCommand);
  tls.setHandshakeTimeout(8);
  xTaskCreatePinnedToCore(netTask, "agap-net", 8192, NULL, 1, NULL, 0);
}

void loop() {
  esp_task_wdt_reset();
  unsigned long now = millis();

  // ---- Safety loop (core 1): runs every second, with or without network ----
  if (now - lastRead >= READ_INTERVAL_MS) {
    lastRead = now;
    float t = sensorFound ? sht31.readTemperature() : NAN;
    float h = sensorFound ? sht31.readHumidity() : NAN;
    if (!isnan(h)) humidity = h;
    bool on = agapStep(ST, LIM, t);
    setHeater(on);
    digitalWrite(PIN_STATUS_LED, on ? ((now / 500) % 2) : LOW);

    if (ST.limitLatched && !lastLatched) pendingEvents |= EV_MAX;
    if (!ST.limitLatched && lastLatched) pendingEvents |= EV_RESUMED;
    if (!ST.sensorOk && lastSensorOk && sensorFound) pendingEvents |= EV_SENSOR;
    lastLatched = ST.limitLatched; lastSensorOk = ST.sensorOk; lastHeater = on;

    Serial.printf("T=%.1f H=%.1f heater=%d enabled=%d limit=%d sensor=%d\n", ST.temp, humidity, on, ST.enabled, ST.limitLatched, ST.sensorOk);
  }

  // Network is handled by netTask on the other core.
  delay(10);
}
