/*
Example application for communication between the Node-Red interface and PFC200 via OPC UA. 
The application pulls weather data from YR.no, and writes the formatted data to a PLC.


Import the following JSON-text in the Node-Red:
*/
[
    {
        "id": "6af14984.743788",
        "type": "tab",
        "label": "Weather Data",
        "disabled": false,
        "info": ""
    },
    {
        "id": "a7d68934.da4c78",
        "type": "http request",
        "z": "6af14984.743788",
        "name": "Hour-by-hour: YR.no",
        "method": "GET",
        "ret": "txt",
        "paytoqs": false,
        "url": "https://www.yr.no/sted/Norge/Oslo/Oslo/Oslo/varsel_time_for_time.xml",
        "tls": "",
        "persist": false,
        "proxy": "",
        "authType": "",
        "x": 520,
        "y": 180,
        "wires": [
            [
                "627f04b3.94550c"
            ]
        ]
    },
    {
        "id": "e97a6433.ab3ac8",
        "type": "inject",
        "z": "6af14984.743788",
        "name": "",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "*/30 5-21 * * *",
        "once": true,
        "onceDelay": 0.1,
        "x": 290,
        "y": 180,
        "wires": [
            [
                "a7d68934.da4c78"
            ]
        ]
    },
    {
        "id": "d27e1739.d33c88",
        "type": "debug",
        "z": "6af14984.743788",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 830,
        "y": 120,
        "wires": []
    },
    {
        "id": "627f04b3.94550c",
        "type": "xml",
        "z": "6af14984.743788",
        "name": "",
        "property": "payload",
        "attr": "",
        "chr": "",
        "x": 690,
        "y": 180,
        "wires": [
            [
                "d27e1739.d33c88",
                "f1c5b883.982068"
            ]
        ]
    },
    {
        "id": "f1c5b883.982068",
        "type": "function",
        "z": "6af14984.743788",
        "name": "Separate()",
        "func": "\n\nvar date = new Date();  //Date that can be used for logic.\ndate = (('00' + date.getHours()).slice(-2)+':'+('00' + date.getMinutes()).slice(-2)+':'+('00' + date.getSeconds()).slice(-2)+''+('00' + date.getDate()).slice(-2) );\n\n\n//var currentHour = Number(('00' + date.getHours()).slice(-2));\n//var nextHour = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[0].$.from[11] + msg.payload.weatherdata.forecast[0].tabular[0].time[0].$.from[12])\n//var prevForecast = { \"temperature\": 0, \"precipitation\": 0, \"ice\": false, \"hour\": 0};\n\n\n//Array that will store the necessary weather data. This can be expanded for other projects.\nvar rain = msg.payload.weatherdata.forecast[0].tabular[0].time[0].precipitation[0].$;\nvar temperature = msg.payload.weatherdata.forecast[0].tabular[0].time[0].temperature[0].$;\nvar nextHours = new Array(4);\n\n\n/*\nif(currentHour+1 == nextHour){\n    prevForecast.temperature = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[i].temperature[0].$.value);\n    prevForecast.precipitation = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[i].precipitation[0].$.value);\n    prevForecast.hour = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[i].$.from[11] + msg.payload.weatherdata.forecast[0].tabular[0].time[i].$.from[12]);\n}*/\n\n//else{\n\n\n//Storing the upcoming hours in different indexes: This hour = 0, hour+1=1, hour+2=2....\n    for (var i = 0; i < 4; i++){\n    nextHours[i] = { \"temperature\": 0, \"precipitation\": 0, \"ice\": false, \"hour\": 0};\n    nextHours[i].temperature = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[i].temperature[0].$.value);\n    nextHours[i].precipitation = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[i].precipitation[0].$.value);\n    nextHours[i].hour = Number(msg.payload.weatherdata.forecast[0].tabular[0].time[i].$.from[11] + msg.payload.weatherdata.forecast[0].tabular[0].time[i].$.from[12]);\n    \n    if(nextHours[i].temperature <= 0){\n        if(nextHours[i].rain > 0){\n            //Rain and below zero : possible icing\n            nextHours[i].ice = true\n        }\n    }\n    \n    \n    }\n//}\n\n//Passing the array as the payload of the msg object.\n\nmsg.payload = nextHours;\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 890,
        "y": 180,
        "wires": [
            [
                "c3476831.cdd5a8",
                "1d86b197.d687de"
            ]
        ]
    },
    {
        "id": "c3476831.cdd5a8",
        "type": "function",
        "z": "6af14984.743788",
        "name": "hour-by-hour",
        "func": "return [msg.payload[0], msg.payload[1], msg.payload[2], msg.payload[3]]\n",
        "outputs": 4,
        "noerr": 0,
        "x": 590,
        "y": 380,
        "wires": [
            [
                "28e78998.fb5706",
                "a1d1b5f5.057eb8"
            ],
            [
                "d2b9e872.603e18",
                "a1d1b5f5.057eb8"
            ],
            [
                "942cbedd.51179",
                "a1d1b5f5.057eb8"
            ],
            [
                "19571296.2fa44d",
                "a1d1b5f5.057eb8"
            ]
        ]
    },
    {
        "id": "28e78998.fb5706",
        "type": "function",
        "z": "6af14984.743788",
        "name": "hour1",
        "func": "//Constructing two msg objects with temp and rain values in payload, respectively.\nmsgTemp = { \"_msgid\": msg._msgid, \"payload\": msg.temperature, \"topic\": \"\"};\nmsgRain = { \"_msgid\": msg._msgid, \"payload\": msg.precipitation, \"topic\": \"\"};\nreturn [msgTemp, msgRain];",
        "outputs": 2,
        "noerr": 0,
        "x": 850,
        "y": 380,
        "wires": [
            [
                "71758c70.507dc4"
            ],
            [
                "6e868f1b.964d"
            ]
        ]
    },
    {
        "id": "d2b9e872.603e18",
        "type": "function",
        "z": "6af14984.743788",
        "name": "hour2",
        "func": "//Constructing two msg objects with temp and rain values in payload, respectively.\nmsgTemp = { \"_msgid\": msg._msgid, \"payload\": msg.temperature, \"topic\": \"\"};\nmsgRain = { \"_msgid\": msg._msgid, \"payload\": msg.precipitation, \"topic\": \"\"};\nreturn [msgTemp, msgRain];",
        "outputs": 2,
        "noerr": 0,
        "x": 850,
        "y": 420,
        "wires": [
            [
                "98892afc.084cc8"
            ],
            [
                "9e58daa2.80b718"
            ]
        ]
    },
    {
        "id": "942cbedd.51179",
        "type": "function",
        "z": "6af14984.743788",
        "name": "hour3",
        "func": "//Constructing two msg objects with temp and rain values in payload, respectively.\nmsgTemp = { \"_msgid\": msg._msgid, \"payload\": msg.temperature, \"topic\": \"\"};\nmsgRain = { \"_msgid\": msg._msgid, \"payload\": msg.precipitation, \"topic\": \"\"};\nreturn [msgTemp, msgRain];",
        "outputs": 2,
        "noerr": 0,
        "x": 850,
        "y": 460,
        "wires": [
            [
                "8b5f24f7.76b2d8"
            ],
            [
                "dbef239d.f5bfb"
            ]
        ]
    },
    {
        "id": "71758c70.507dc4",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour1.temp",
        "datatype": "SByte",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 300,
        "wires": [
            [
                "5b301417.a5460c"
            ]
        ]
    },
    {
        "id": "98892afc.084cc8",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour2.temp",
        "datatype": "SByte",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 380,
        "wires": [
            [
                "5b301417.a5460c"
            ]
        ]
    },
    {
        "id": "4e75f74f.c3d408",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour4.temp",
        "datatype": "SByte",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 540,
        "wires": [
            [
                "71d7a5e2.9fcc7c"
            ]
        ]
    },
    {
        "id": "1d86b197.d687de",
        "type": "debug",
        "z": "6af14984.743788",
        "name": "debug1",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 1060,
        "y": 120,
        "wires": []
    },
    {
        "id": "19571296.2fa44d",
        "type": "function",
        "z": "6af14984.743788",
        "name": "hour4",
        "func": "//Constructing two msg objects with temp and rain values in payload, respectively.\nmsgTemp = { \"_msgid\": msg._msgid, \"payload\": msg.temperature, \"topic\": \"\"};\nmsgRain = { \"_msgid\": msg._msgid, \"payload\": msg.precipitation, \"topic\": \"\"};\nreturn [msgTemp, msgRain];",
        "outputs": 2,
        "noerr": 0,
        "x": 850,
        "y": 500,
        "wires": [
            [
                "4e75f74f.c3d408"
            ],
            [
                "42d5228c.c6329c"
            ]
        ]
    },
    {
        "id": "42d5228c.c6329c",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour4.rain",
        "datatype": "Float",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 580,
        "wires": [
            [
                "71d7a5e2.9fcc7c"
            ]
        ]
    },
    {
        "id": "a1d1b5f5.057eb8",
        "type": "debug",
        "z": "6af14984.743788",
        "name": "debug2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "x": 860,
        "y": 340,
        "wires": []
    },
    {
        "id": "6e868f1b.964d",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour1.rain",
        "datatype": "Float",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 340,
        "wires": [
            [
                "5b301417.a5460c"
            ]
        ]
    },
    {
        "id": "9e58daa2.80b718",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour2.rain",
        "datatype": "Float",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 420,
        "wires": [
            [
                "5b301417.a5460c"
            ]
        ]
    },
    {
        "id": "8b5f24f7.76b2d8",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour3.temp",
        "datatype": "SByte",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 460,
        "wires": [
            [
                "71d7a5e2.9fcc7c"
            ]
        ]
    },
    {
        "id": "dbef239d.f5bfb",
        "type": "OPCUA-IIoT-Node",
        "z": "6af14984.743788",
        "injectType": "write",
        "nodeId": "ns=4;s=|var|WAGO 750-8213 PFC200 G2 2ETH CAN.Application.PLC_PRG.hour3.rain",
        "datatype": "Float",
        "value": "",
        "name": "",
        "topic": "",
        "showErrors": false,
        "x": 1130,
        "y": 500,
        "wires": [
            [
                "71d7a5e2.9fcc7c"
            ]
        ]
    },
    {
        "id": "5b301417.a5460c",
        "type": "OPCUA-IIoT-Write",
        "z": "6af14984.743788",
        "connector": "ed100b9e.022398",
        "name": "",
        "justValue": false,
        "showStatusActivities": false,
        "showErrors": false,
        "x": 1350,
        "y": 420,
        "wires": [
            []
        ]
    },
    {
        "id": "71d7a5e2.9fcc7c",
        "type": "OPCUA-IIoT-Write",
        "z": "6af14984.743788",
        "connector": "ed100b9e.022398",
        "name": "",
        "justValue": false,
        "showStatusActivities": false,
        "showErrors": false,
        "x": 1350,
        "y": 460,
        "wires": [
            []
        ]
    },
    {
        "id": "ed100b9e.022398",
        "type": "OPCUA-IIoT-Connector",
        "z": "",
        "discoveryUrl": "opc.tcp://192.168.5.19:4840",
        "endpoint": "opc.tcp://192.168.5.19:4840",
        "keepSessionAlive": true,
        "loginEnabled": false,
        "securityPolicy": "None",
        "securityMode": "NONE",
        "name": "OPCUA",
        "showErrors": false,
        "individualCerts": false,
        "publicCertificateFile": "",
        "privateKeyFile": "",
        "defaultSecureTokenLifetime": "",
        "endpointMustExist": false,
        "autoSelectRightEndpoint": true,
        "strategyMaxRetry": "",
        "strategyInitialDelay": "",
        "strategyMaxDelay": "",
        "strategyRandomisationFactor": "",
        "requestedSessionTimeout": "",
        "connectionStartDelay": "",
        "reconnectDelay": "",
        "maxBadSessionRequests": "10"
    }
]