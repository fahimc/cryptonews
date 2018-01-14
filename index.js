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
    PULL_DELAY: (60000 * 1),
    currentSaveIndex: 0,
    init() {
        CoinMarketCap.getAllCoins(this.onComplete.bind(this));
        http.listen(port, function() {
            console.log('listening on *:' + port);
        });
    },
    onComplete(data) {
        if(!data){
            this.next();
            return;
        }
        this.saveIndividualCoins(data);
        let cheapData = CoinMarketCap.findCheapCoinsMovingUp(data);
        this.saveRealtimeChanges(cheapData);
        fs.writeFile('dist/data/cheapcoins_1h.json', JSON.stringify(cheapData, null, 2), (err) => {
            if (err) throw err;
            console.log('saved cheap coins');
            this.next();
        });
    },
    saveIndividualCoins(data) {
        this.saveNext(data);
    },
    saveNext(data) {
        if (this.currentSaveIndex > data.length - 1) {
            this.currentSaveIndex=0;
            console.log('saved all inidividual coins');
            return;
        }
        let item = data[this.currentSaveIndex];
        fs.writeFile(`dist/data/coin/${this.getlastpartOfLink(item.link)}.json`, JSON.stringify(item, null, 2), (err) => {
            if (err) throw err;
            this.currentSaveIndex++;
            this.saveNext(data);
        });
    },
    replaceSpecialChars(name){
        name = name.replace(/\./g,'-');
        name =  name.replace(/\s/g,'-');
        name =  name.replace(/\//g,'-');
        name =  name.replace(/\//g,'-');
        return name;
    },
    getlastpartOfLink(link){
        let arr =  link.split('/');
        let part = arr[arr.length-1].trim().indexOf('') >= 0 ? arr[arr.length-2] : arr[arr.length-1];
        return part.toLowerCase();
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
            let key = this.getlastpartOfLink(dataItem.link);
            // /console.log(key);
            let item = content[key];
            let maxHourCount = 60;
            if (!item) {
                item = {
                    symbol: dataItem.symbol,
                    name: dataItem.name,
                    link:dataItem.link,
                    priceHistory: []
                }
            }
            item.priceHistory.unshift({
                price: dataItem.price,
                date: Math.floor(Date.now() / 1000)
            });
            if (item.priceHistory.length > maxHourCount) {
                item.priceHistory.pop();
            }
            content[key] = item;
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