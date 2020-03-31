#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <OneWire.h> //подключение библиотеки OneWire
#include <DallasTemperature.h> //подключение библиотеки для работы с датчиком
 
#define ONE_WIRE_BUS 14 //шина передачи данных

#ifndef STASSID
#define STASSID "DELYSID"
#define STAPSK  "cannabis"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

OneWire oneWire(ONE_WIRE_BUS); //создание объекта oneWire для передачи данных по технологии OneWire
DallasTemperature sensors(&oneWire); //создание объектов типа DallasTemperature дял измерения температуры
ESP8266WebServer server(80);

const int led = 13;

void handleRoot() {

  sensors.requestTemperatures(); //запрос температуры устройств
  
  String msg = "<!DOCTYPE HTML>";
  msg += "<html><head><style>";
  msg += "body {text-align: center; background-color: DarkGray; color: green;}";
  msg += "h2 {margin-top: 50%; font-size: 50px;} h1 {font-size: 70px;}</style></head>";
  msg += "<body><h2>Hello from ESP8266!</h2>";
  msg += "<h1>Temperature is ";
  msg += sensors.getTempCByIndex(0);
  msg += "</h1></body></html>";
  
  server.send(200, "text/html", msg);
    
  Serial.print("Temperature is: ");
  Serial.println(sensors.getTempCByIndex(0));
    
}

void handleNotFound() {
  digitalWrite(led, 1);
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
  digitalWrite(led, 0);
}

void setup(void) {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
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

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);

  server.on("/inline", []() {
    server.send(200, "text/plain", "this works as well");
  });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  sensors.begin(); //инициализация датчика(ков)
}

void loop(void) {
  server.handleClient();
  MDNS.update();

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

  delay(5000);
  
}
