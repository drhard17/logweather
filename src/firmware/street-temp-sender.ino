#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h> 
 
#define ONE_WIRE_BUS 14 

#define PERIOD 15
#define MINUTES 60000

#ifndef STASSID
#define STASSID ""
#define STAPSK  ""
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

OneWire oneWire(ONE_WIRE_BUS); 
DallasTemperature sensors(&oneWire); 
ESP8266WebServer server(80);
HTTPClient http;

void requestTemp(int counter = 0) {
  sensors.requestTemperatures();
  delay(10);
  if ((sensors.getTempCByIndex(0) > 50 || sensors.getTempCByIndex(0) < -50) && counter < 3) {
    Serial.println("WRONG TEMP");
    delay(500);
    requestTemp(counter + 1);
  }
}

void handleRoot() {

  requestTemp();
  
  String msg = "<!DOCTYPE HTML>";
  msg += "<html><head>";
  msg += "<title>Logweather local</title>";
  msg += "<style>body {text-align: center; background-color: DarkGray; color: green;}";
  msg += "h2 {margin-top: 20%; font-size: 50px;} h1 {font-size: 70px;}</style></head>";
  msg += "<body><h2>Hello from ESP8266!</h2>";
  msg += "<h1>Temperature is ";
  msg += getRoundedTemp();
  msg += "&deg;C";
  msg += "</h1></body></html>";
  
  server.send(200, "text/html", msg);
    
  Serial.print("Temperature is: ");
  Serial.println(getRoundedTemp());
    
}

int getRoundedTemp() {
  double t = sensors.getTempCByIndex(0);
  return round(t);
}

void sendTempPost() {

  String Link = "http://45.135.164.204/storesensordata";
  
  requestTemp();
  int temp = getRoundedTemp();
  
  http.begin(Link);
  http.addHeader("Content-Type", "application/json");
  String body = "{\"name\":\"STREET\",\"locId\":101,\"temp\":" + String(temp) + "}";
  int httpCode = http.POST(body);
  
  Serial.println(Link);
  Serial.println(httpCode);

  http.end();
}

void setup(void) {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

    while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/refresh", []() {
    sendTempPost();
    delay(100);
    handleRoot();    
  });
  
  server.begin();
  Serial.println("HTTP server started");
  sensors.begin(); 

  sendTempPost();
}

void loop(void) {
  server.handleClient();
  if ((millis() % (PERIOD * MINUTES)) == 0) {
    sendTempPost();  
  }
}