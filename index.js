let CoinMarketCap = require('./getAllCoins.js');
let fs = require('fs');
let path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000;
app.use(express.static('dist'))
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});


const Main = {
    init() {
        CoinMarketCap.getAllCoins(this.onComplete.bind(this));
        http.listen(port, function() {
            console.log('listening on *:' + port);
        });
    },
    onComplete(data) {
        let cheapData = CoinMarketCap.findCheapCoinsMovingUp(data);
        fs.writeFile(path.resolve(__dirname, 'dist/data/cheapcoins_1h.json'), JSON.stringify(cheapData, null, 2), (err) => {
            if (err) throw err;
            console.log('saved');
            this.next();
        });
    },
    next() {
        setTimeout(() => {
            CoinMarketCap.getAllCoins(this.onComplete.bind(this));
        }, (60000 * 5));
    }
};
Main.init();