'''before executing this file 
1. install AWS IoT SDK for python development using command'pip install AWSIoTPythonSDK' 
2. create a folder 'certificates' and paste aws certificates there '''

import json
import time
import os
import sys
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient as awsMqtt

#configure mqtt client to connect with aws IoT core
mqttClient = awsMqtt("rpi-client")
mqttClient.configureEndpoint('Update your endpoint here',8883)#update your IOT endpoint here
mqttClient.configureCredentials('./certificates/AmazonRootCA1.pem','./certificates/private.pem.key','./certificates/ssl-certificate.pem') #update certificate filename here

thingName = 'esp-8266'
updateAcceptedTopic = "$aws/things/"+thingName+"/shadow/update/accepted"
updateRejectedTopic = "$aws/things/"+thingName+"/shadow/update/rejected"



#connect to client
connected = mqttClient.connect()
print("connected : ",connected)

counter = 0

def print_message(client,userData,msg): #callback function when message is received on subscribed topic
    global counter

    updateTopic = "$aws/things/esp-8266/shadow/update"
    payload = json.loads(msg.payload)
    print(payload)

    try:
        reported_payload = payload["state"]["reported"]
    except Exception as e:
        print(e)
        return
    print(payload)
    led_state   = reported_payload['led']
    temperature = reported_payload['temperature']
    humidity    = reported_payload['humidity']

    if temperature>35 or humidity<70:  #if temperature is greater than 35 deg C and relative humidity is less than 70 led will be turn on
        msg_to_pub = {
            "state":{
                "desired":{
                    "led": 0
                }
            }
        }
        print(msg_to_pub)
        mqttClient.publish(updateTopic,json.dumps(msg_to_pub),0)
        print("publish completed")
        
    else:
        msg_to_pub = {
            "state":{
                "desired":{
                    "led": 1
                }
            }
        }

        print(msg_to_pub)
        mqttClient.publish(updateTopic,json.dumps(msg_to_pub),0)
        print("publish completed")




while True:
    mqttClient.subscribe(updateAcceptedTopic,1,print_message)
    mqttClient.subscribe(updateRejectedTopic,1,print_message)