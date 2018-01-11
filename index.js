let CoinMarketCap = require('./getAllCoins.js');
let fs = require('fs');
let path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 80;
app.use(express.static('dist'))
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});
app.set('port', port);

const Main = {
    PULL_DELAY:(60000 * 5),
    init() {
        CoinMarketCap.getAllCoins(this.onComplete.bind(this));
        http.listen(port, function() {
            console.log('listening on *:' + port);
        });
    },
    onComplete(data) {
        let cheapData = CoinMarketCap.findCheapCoinsMovingUp(data);
        this.saveRealtimeChanges(cheapData);
        fs.writeFile('dist/data/cheapcoins_1h.json', JSON.stringify(cheapData, null, 2), (err) => {
            if (err) throw err;
            console.log('saved cheap coins');
            this.next();
        });
    },
    saveRealtimeChanges(data) {
        let filePath = "dist/data/realtime_changes.json";
        var content = {};
        try {
            content = fs.readFileSync(filePath);
            content = JSON.parse(content);      
        } catch (error) {

        }
        data.forEach((dataItem) => {
            let item = content[dataItem.symbol];
            let maxHourCount = 12;
            if (!item) {
                item = {
                    symbol: dataItem.symbol,
                    name: dataItem.name,
                    priceHistory: []
                }
            }
            item.priceHistory.unshift({
                price: dataItem.price,
                date: Math.floor(Date.now() / 1000)
            });
            if(item.priceHistory.length > maxHourCount){
                item.priceHistory.pop();
            }
            content[dataItem.symbol] = item;
        });
        fs.writeFile(filePath, JSON.stringify(content, null, 2), (err) => {
            if (err) throw err;
            console.log('saved realtime data');
        });
    },
    next() {
        setTimeout(() => {
            CoinMarketCap.getAllCoins(this.onComplete.bind(this));
        }, this.PULL_DELAY);
    }
};
Main.init();