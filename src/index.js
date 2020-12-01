/**
 * 温度を読み取るライブラリがLGPL-3.0なので気を付けて
 */

// GPIO
const gpio = require("rpi-gpio")
const LIGHT_PIN = 10
gpio.setup(LIGHT_PIN, gpio.DIR_OUT)
// 温度計
const sensor = require("node-dht-sensor");
const SENSOR_PIN = 14;
// コマンド実行
const { exec } = require("child_process");

// expressを利用して情報をやり取りする。ローカル向け。firebase落ちるとか無いと思うけど一応(レートリミット対策)
const apiServer = require('./APIServer')
const api = new apiServer()

/**
 * 赤外線を飛ばすときによぶ高階関数。Firebase版/express版共通で使える
 */
const irCallback = (device, isOn) => {
    switch (device) {
        case 'led':
            // Lチカ
            gpio.write(LIGHT_PIN, isOn)
            break
        case 'light':
            // テレビ？
            let light = isOn ? "tv_on" : 'tv_off'
            const run = exec(`cd ~ && python3 irrp.py -p -g17 -f codes ${light}`)
            break
    }
}

// コールバックセット
api.irCallback = irCallback

// 温度、湿度を送信する関数
const postData = () => {
    // CPU温度を取りに行く
    exec('vcgencmd measure_temp', (err, stdout, stderr) => {
        if (err) {
            console.log("CPU温度取得失敗")
            return
        }
        // 部屋の温度取りに行く
        sensor.read(11, SENSOR_PIN, (err, temp, humid) => {
            setSensorValue(temp, humid, parseFloat(stdout.replace('temp=', '').replace('\'C', '')))
        })
    })
}

postData()

/** センサーの値をセットする */
const setSensorValue = (temp, humid, cpu) => {
    // 取得できた
    api.setSensorValue(temp, humid, cpu)
}

console.log("準備完了")

// 定期実行
setInterval(() => { postData() }, 1000 * 60 * 5)

