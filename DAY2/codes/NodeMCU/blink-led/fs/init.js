load('api_gpio.js'); //we import GPIO package to work with GPIO Pin
load('api_timer.js'); //Timer package for timer functions


let ledPin = 2; //ESP8266 Has onboard pin connected to GPIO2
let ledState = 1; //variable to maintain state of led (initally off)

GPIO.set_mode(ledPin, GPIO.MODE_OUTPUT); //set GPIO2 as output pin

GPIO.write(ledpin,ledState); //ESP8266 pin is active low hence state 1 = off

/*Now go to MOS Tool and run command 'mos build --platform esp8266' and after build completed
run 'mos flash' (make sure esp8266 is connected with system), you will see on board led will be on */



Timer.set(1000, Timer.REPEAT, function(){  //after every one second callback function will be executed and it will invert state of led
    ledState = !ledState;
    GPIO.write(ledPin,ledState);
}, null);



/*Now again go to MOS Tool and run command 'mos build --platform esp8266' and after build completed
run 'mos flash' (make sure esp8266 is connected with system), you will see on board led will be on */