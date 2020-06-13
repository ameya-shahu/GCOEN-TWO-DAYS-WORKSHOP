/* before building this project
        1. Create things on AWS Iot core platform and download certificates
        2. Paste certicate into 'fs' folder
        3. Make changes into 'fs/conf1.json' file
*/

load('api_gpio.js');
load('api_mqtt.js');
load('api_timer.js');
load('api_config.js');
load('api_net.js');
load('api_sys.js');
load('api_dht.js');



//config for led (esp8266 onboard led = GPIO2)
let ledPin = 2;
let ledState = 1; //Initially off (active low led hence state is 1)
GPIO.set_mode(ledPin, GPIO.MODE_OUTPUT);

//config for dht sensor
let dhtPin = 5;  //DATA pin of DHT sesnsor connected at GPIO5
let dhtSens = DHT.create(dhtPin, DHT.DHT11);


let thingName = 'esp-8266';



//AWS TOPIC
let updateTopic = "$aws/things/"+thingName+"/shadow/update";
let updateAcceptedTopic = "$aws/things/"+thingName+"/shadow/update/accepted";
let updateRejectedTopic = "$aws/things/"+thingName+"/shadow/update/rejected";
let updateDeltaTopic = "$aws/things/"+thingName+"/shadow/update/delta";



function report(){
    print("reporting to AWS IoT");

    let message = JSON.stringify({
        "state":{
            "reported":{
                "led": ledState, //set led state
                "temperature":dhtSens.getTemp(), //read temperature
                "humidity": dhtSens.getHumidity() //read Humindity
            }
        }
    });
    print(message);
    MQTT.pub(updateTopic, message, 1);
    print("Reporting completed");
}

Timer.set(5000, Timer.REPEAT, function(){ //Report data to AWS MQTT broker after every 5 sec
    report();
}, null);


//Subcribe updateDelta topic
MQTT.sub(updateDeltaTopic, function(conn, topic, msg) {
  print('Topic:', topic, 'message:', JSON.stringify(msg));
  let m = JSON.parse(msg);
  //print(m);
  ledState = m.state["led"];
  GPIO.write(ledPin, ledState);
  report();
}, null);


//Handler for internet connectivity
Net.setStatusEventHandler(function(ev, arg) {
    let evs = '???';
    if (ev === Net.STATUS_DISCONNECTED) {
      evs = 'DISCONNECTED';
    } else if (ev === Net.STATUS_CONNECTING) {
      evs = 'CONNECTING';
    } else if (ev === Net.STATUS_CONNECTED) {
      evs = 'CONNECTED';
    } else if (ev === Net.STATUS_GOT_IP) {
      evs = 'GOT_IP';
    }
    print('== Net event:', ev, evs);
  }, null);
  
/*go to mos tool build and project for any doubt you can contact me*/