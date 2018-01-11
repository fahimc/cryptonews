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
    mapRealtimeData(data){
       this.cheapCoinData.forEach((item)=>{
            let realtimeItem = data[item.symbol];
            var sum = null ;
            realtimeItem.priceHistory.forEach((priceItem)=>{
                let price = Number(priceItem.price.replace('$',''));
                console.log(price);
                    if(sum === null)
                    {
                        sum =   price  
                    }else{
                         sum += price;
                    }
                   
            });

            let averagePrice = sum/realtimeItem.priceHistory.length;
            let currentPrice = Number(item.price.replace('$',''));
            let change = ((Math.abs(averagePrice - currentPrice)/currentPrice) * 100).toFixed(2);
            item.realtimeChange = change + '%';
       });     
    },
    populateCheapCoins(data) {
        let tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach((item) => {
            let row = document.createElement('TR');
            let class_24h = Number(item.percent_24h.replace('%', '')) < 0 ? 'table-danger' : 'table-success';
            let class_7d = Number(item.percent_7d.replace('%', '')) < 0 ? 'table-danger' : 'table-success';
            let class_1h = Number(item.percent_1h.replace('%', '')) < 0 ? 'table-danger' : 'table-success';
            let class_realtime = Number(item.realtimeChange.replace('%', '')) < 0 ? 'table-danger' : 'table-success';
            let content = `<td>${item.name}</td><td>${item.symbol}</td><td>${item.marketCap}</td><td>${item.volume}</td><td class="${class_1h}">${item.percent_1h}</td><td class="${class_24h}">${item.percent_24h}</td><td class="${class_7d}">${item.percent_7d}</td><td class="${class_realtime}">${item.realtimeChange}</td><td>${item.price}</td><td></td>`;
            row.innerHTML = content;

            tbody.appendChild(row);
        });
    },
    run() {
        setTimeout(() => {
            this.loadCheapCoins();
        }, (60000 * 1));
    }
};

Main.init();