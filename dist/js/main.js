const Main = {
    cheapCoinData: null,
    init() {
        document.addEventListener('DOMContentLoaded', this.onLoaded.bind(this));
    },
    onLoaded() {
        this.loadCheapCoins();
    },
    loadCheapCoins() {
        var file = 'data/cheapcoins_1h.json';
        this.loadFile(file, this.onCheapCoinsLoaded.bind(this));
    },
    loadRealtime() {
        var file = 'data/realtime_changes.json';
        this.loadFile(file, this.onRealtimeComplete.bind(this));
    },
    loadFile(url, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);
        xobj.onreadystatechange = () => {
            if (xobj.readyState == 4 && xobj.status == "200") {
                if (callback) callback(xobj.responseText);
            }
        };
        xobj.send(null);
    },
    onRealtimeComplete(data) {
        data = JSON.parse(data);
        this.mapRealtimeData(data);
        this.populateCheapCoins(this.cheapCoinData);
        this.run();
    },
    onCheapCoinsLoaded(data) {
        data = JSON.parse(data);
        this.cheapCoinData = data;
        this.loadRealtime();
    },
    mapRealtimeData(data) {
        this.cheapCoinData.forEach((item) => {
            let realtimeItem = data[item.symbol];
            var sum = null;
            var sumForShort = null;
            let shortTermChange = [];
            realtimeItem.priceHistory.forEach((priceItem, index) => {
                let price = Number(priceItem.price.replace('$', ''));
                if (sum === null) {
                    sum = price;
                    sumForShort = price;
                } else {
                    sum += price;
                }
                if (index < 4) {
                    sumForShort += price;
                    shortTermChange.push(price);
                }

            });

            let averagePrice = sum / realtimeItem.priceHistory.length;
            let currentPrice = Number(item.price.replace('$', ''));
            let change = ((Math.abs(averagePrice - currentPrice) / currentPrice) * 100).toFixed(2);
            item.realtimeChange = change + '%';
            item.change15Mins = this.get15minChange(sumForShort, shortTermChange);
            item.direction15Mins = this.get15minDirection(shortTermChange);
            item.recommendation = this.getRecommendation(item.direction15Mins, item.change15Mins, item.realtimeChange);
        });
    },
    populateCheapCoins(data) {
        let tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        this.sortBy15mins(data);
        data.forEach((item) => {
            let row = document.createElement('TR');
            let class_24h = this.getPercentageCellColor(item.percent_24h);
            let class_1h = this.getPercentageCellColor(item.percent_1h);
            let class_7d = this.getPercentageCellColor(item.percent_7d);
            let class_realtime = this.getPercentageCellColor(item.realtimeChange);
            let class_realtime_15m = this.getPercentageCellColor(item.change15Mins);
            let class_recommendation = item.recommendation === 'STRONG BUY' ? 'table-success' : (item.recommendation === 'BUY' ? 'table-warning' : '');
            let class_direction = item.direction15Mins === 'RAISE' ? 'table-success' : (item.direction15Mins === 'FALL' ? 'table-danger' : '');
            let content = `<td><a href="https://coinmarketcap.com/${item.link}" target="_blank" >${item.name}</a></td>
            <td>${item.symbol}</td>
            <td>${item.marketCap}</td>
            <td>${item.volume}</td>
            <td class="${class_1h}">${item.percent_1h}</td>
            <td class="${class_24h}">${item.percent_24h}</td>
            <td class="${class_7d}">${item.percent_7d}</td>
            <td class="${class_realtime}">${item.realtimeChange}</td>
            <td class="${class_realtime_15m}">${item.change15Mins}</td>
            <td class="${class_direction}">${item.direction15Mins}</td>
            <td>${item.price}</td>
            <td class="${class_recommendation}">${item.recommendation}</td>`;
            row.innerHTML = content;

            tbody.appendChild(row);
        });
    },
    replaceSign(price,sign) {
        if(!sign)sign= '%';
        return Number(price.replace('%', ''));
    },
    getPercentageCellColor(num) {
        return this.replaceSign(num) < 0 ? 'table-danger' : (this.replaceSign(num) > 0 ? 'table-success' : '');
    },
    get15minChange(sum, collection) {
        let currentPrice = collection[0];
        let averagePrice = sum / collection.length;
        let change = 0;
        if (collection.length > 2) change = ((Math.abs(averagePrice - currentPrice) / currentPrice) * 100).toFixed(2);
        return change + '%';
    },
    get15minDirection(collection) {
        collection.reverse();
        let direction = 'NO CHANGE';
        let raise = 0;
        let falls = 0;
        let previousPrice = collection[0];
        collection.forEach((price) => {
            if (previousPrice > price) falls++;
            if (previousPrice < price) raise++;
            previousPrice = price;
        });
        if (raise > falls) direction = 'RAISE';
        if (raise < falls) direction = 'FALL';
        return direction;
    },
    sortBy15mins(data) {
        data.sort((itemA,itemB) => {
                return (this.replaceSign(itemB.change15Mins) && itemB.direction15Mins === 'RAISE') - (this.replaceSign(itemA.change15Mins) && itemA.direction15Mins === 'RAISE');
        });
    },
    getRecommendation(direction, change15Mins, changeRealtime) {
        change15Mins =  this.replaceSign(change15Mins);
        changeRealtime = this.replaceSign(changeRealtime);
        let type = '';
        if (changeRealtime && change15Mins && direction === 'RAISE') {
            type = 'STRONG BUY';
        } else if (changeRealtime && change15Mins && direction === 'NO CHANGE') {
            type = 'BUY';
        } else if (change15Mins && (direction === 'NO CHANGE' || direction === 'RAISE' )) {
            type = 'BUY';
        }
        return type;
    },
    run() {
        setTimeout(() => {
            this.loadCheapCoins();
        }, (60000 * 1));
    }
};

Main.init();