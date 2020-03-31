#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <OneWire.h> //подключение библиотеки OneWire
#include <DallasTemperature.h> //подключение библиотеки для работы с датчиком
 
#define ONE_WIRE_BUS 14 //шина передачи данных

#define PERIOD 15
#define MINUTES 60000

#ifndef STASSID
#define STASSID "" // wifi ssid
#define STAPSK  "" //wifi password
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

OneWire oneWire(ONE_WIRE_BUS); 
DallasTemperature sensors(&oneWire); 
ESP8266WebServer server(80);

void handleRoot() {

  sensors.requestTemperatures(); //запрос температуры устройств
  
  String msg = "<!DOCTYPE HTML>";
  msg += "<html><head>";
  msg += "<title>Logweather local</title>";
  msg += "<style>body {text-align: center; background-color: DarkGray; color: green;}";
  msg += "h2 {margin-top: 50%; font-size: 50px;} h1 {font-size: 70px;}</style></head>";
  msg += "<body><h2>Hello from ESP8266!</h2>";
  msg += "<h1>Temperature is ";
  msg += sensors.getTempCByIndex(0);
  msg += "</h1></body></html>";
  
  server.send(200, "text/html", msg);
    
  Serial.print("Temperature is: ");
  Serial.println(sensors.getTempCByIndex(0));
    
}

void sendTemp() {
  
  HTTPClient http;
  String getData, Link;
  //GET Data
  getData = "?temp=";
  getData += sensors.getTempCByIndex(0);
  Link = "http://45.135.164.204/" + getData;

  http.begin(Link);
  
  int httpCode = http.GET();
  String payload = http.getString();
  
  Serial.println(httpCode);
  Serial.println(payload);

  http.end();  
}

void setup(void) {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
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
  server.begin();
  Serial.println("HTTP server started");
  
  sensors.begin(); //инициализация датчика
}

void loop(void) {
  server.handleClient();
  if ((millis() % (PERIOD * MINUTES)) == 0) {
    sendTemp();  
  }
}