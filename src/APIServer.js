const express = require('express')
const app = express()
const bodyParser = require('body-parser');

/**
 * expressを利用して温度、赤外線送信をする。ローカル。
 */
module.exports = class APIServer {

    // 温度、湿度、CPU温度
    temp = -1
    humid = -1
    cpu = -1

    /**
     * 赤外線を送信しろってメッセージが来たら呼ばれる高階関数
     */
    irCallback = (device, isOn) => { };

    constructor() {

        // POSTはこれが必須
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        // センサーの情報を返すAPI
        app.get('/api/sensor', (req, res) => {
            res.send({
                temp: this.temp,
                humid: this.humid,
                cpu: this.cpu,
            })
        })

        // 赤外線送信API
        app.post('/api/ir', (req, res) => {
            const requestBody = req.body
            this.irCallback(requestBody.device, requestBody.isOn)
            res.send({ status: 'ok' })
        })

        // サーバー起動
        const server = app.listen(4545, () => {
            const host = server.address().address
            const port = server.address().port
            console.log(`APIのURL -> http://localhost:${port}`)
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
    }


}