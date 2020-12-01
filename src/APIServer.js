const express = require('express')
const app = express()
const bodyParser = require('body-parser');

/**
 * expressを利用して温度、赤外線送信をする。ローカル。
 */
module.exports = class APIServer {
/*
    // 温度、湿度、CPU温度
    temp = -1
    humid = -1
    cpu = -1

    // 赤外線送信の履歴が入ってるオブジェクト
    irHistoryObject = {}
    
    // 赤外線を送信しろってメッセージが来たら呼ばれる高階関数
    irCallback = (device, isOn) => { };
*/

    constructor() {

        // 初期化
	this.irHistoryObject = {}


        // POSTはこれが必須
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

	// CORSを許可する
	app.use(function(req, res, next) {
  	    res.header("Access-Control-Allow-Origin", "*");
  	    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	    next();
	});	

        // センサーの情報を返すAPI
        app.get('/api/sensor', (req, res) => {
            res.send({
		date: {
		    seconds: parseInt(this.date / 1000),
		    nanoseconds: this.date,
		},
                temp: this.temp,
                humid: this.humid,
                cpu_temp: this.cpu,
            })
        })

        // 現在の照明の状態。わからん
	app.get('/api/current_ir', (req, res) => {
	    res.send(this.irHistoryObject)
	   
	})

        // 赤外線送信API
        app.post('/api/send_ir', (req, res) => {
            const requestBody = req.body
	    this.irHistoryObject[requestBody.device] = requestBody.isOn
            this.irCallback(requestBody.device, requestBody.isOn)
            res.send({ status: 'ok' })
        })

        // サーバー起動
        const server = app.listen(4545, () => {
            const host = server.address().address
            const port = server.address().port
            console.log(host)
	    console.log(`APIのURL -> http://localhost:${port}`)
	    console.log(`APIのURL -> http://raspberrypi.local:${port}`)
        })

    }

    /**
     * センサーの値をセットする
     * APIのレスポンスで使う
     */
    setSensorValue(temp, humid, cpu) {
        this.temp = temp
        this.humid = humid
        this.cpu = cpu
   	this.date = Date.now()
    }


}
