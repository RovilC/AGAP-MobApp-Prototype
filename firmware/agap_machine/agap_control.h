// AGAP – heater safety and control logic (pure C++, no Arduino calls, unit-tested on a PC).
// The microcontroller enforces these rules on its own, whatever the app says or if the network is down.
#pragma once
#include <math.h>

struct AgapLimits {
  float maxTemp    = 80.0f;  // hard limit: heater forced OFF at or above this
  float resumeTemp = 75.0f;  // after hitting the limit, heater may come back only below this
  float warnTemp   = 75.0f;  // app shows a "near max" warning from here
  float band       = 1.5f;   // normal thermostat band below the setpoint
  float minValid   = -20.0f; // readings outside this range are treated as sensor faults
  float maxValid   = 125.0f;
  int   faultReads = 3;      // consecutive bad reads before declaring a sensor error
};

struct AgapState {
  bool  enabled    = false;  // heating requested (batch running on electric heat)
  float setpoint   = 68.0f;  // target chamber temperature, clamped to 40..80
  bool  limitLatched = false; // true after reaching maxTemp until temp < resumeTemp
  bool  demand     = false;  // thermostat wants heat (with hysteresis)
  int   badReads   = 0;
  bool  sensorOk   = false;  // false until the first valid reading
  float temp       = NAN;    // last valid chamber temperature
  bool  heaterOn   = false;  // output actually driven
};

inline float agapClampSetpoint(float sp) {
  if (isnan(sp)) return 68.0f;
  if (sp < 40.0f) return 40.0f;
  if (sp > 80.0f) return 80.0f;
  return sp;
}

// Feed one sensor reading (NAN if the read failed). Returns the new heater output.
inline bool agapStep(AgapState &s, const AgapLimits &L, float reading) {
  bool valid = !isnan(reading) && reading >= L.minValid && reading <= L.maxValid;
  if (valid) { s.badReads = 0; s.sensorOk = true; s.temp = reading; }
  else if (++s.badReads >= L.faultReads) { s.sensorOk = false; }

  // 1) Hard limit with latch: off at >= max, stays off until below resume temp.
  if (s.sensorOk) {
    if (s.temp >= L.maxTemp) s.limitLatched = true;
    else if (s.limitLatched && s.temp < L.resumeTemp) s.limitLatched = false;
  }

  // 2) Thermostat around the setpoint (never above max).
  float sp = agapClampSetpoint(s.setpoint);
  if (s.sensorOk) {
    if (s.temp >= sp) s.demand = false;
    else if (s.temp <= sp - L.band) s.demand = true;
  } else {
    s.demand = false;
  }

  // 3) Output: everything must agree. Sensor fault => heater off.
  s.heaterOn = s.enabled && s.sensorOk && !s.limitLatched && s.demand && s.temp < L.maxTemp;
  return s.heaterOn;
}

inline bool agapWarning(const AgapState &s, const AgapLimits &L) { return s.sensorOk && s.temp >= L.warnTemp; }
