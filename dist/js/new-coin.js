const Main = {
    version: 1.36,
    cheapCoinData: null,
    currentPage: '',
    currencies: {
        BTC: 0
    },
    init() {
        document.addEventListener('DOMContentLoaded', this.onLoaded.bind(this));
    },
    onLoaded() {
        this.loadFile('data/newcoins.json', this.onComplete.bind(this));
    },
    loadFile(url, callback, ignoreRetry) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);
        xobj.onreadystatechange = () => {
            if (xobj.readyState == 4 && xobj.status == "200") {
                if (callback) callback(xobj.responseText);
            }
        };
        try {
            xobj.send(null);
        } catch (e) {
            if (!ignoreRetry) this.onLoaded();
        }

    },
     onComplete(data) {
        data = JSON.parse(data);
        this.populateTable(data);
    },
    populateTable(data) {
        let tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach((item) => {
            console.log(item);
            let row = document.createElement('TR');
            let class_24h = Main.getPercentageCellColor(item.percent_24h);
            let content = `<td><a class="text-white" href="//coinmarketcap.com/${item.link}" target="_blank" >${item.name}</a></td>
            <td>${item.symbol}</td>
            <td>${item.marketCap}</td>
            <td>${item.added}</td>
            <td>${item.price}</td>
            <td>${item.volume}</td>
            <td>${item.supply}</td>
            <td class="${class_24h}">${item.percent_24h}</td>
            `;
            row.innerHTML = content;

            tbody.appendChild(row);
        });
        document.querySelector('#loading').classList.add('hide');
    },
    replaceSign(price, sign) {
        if (!sign) sign = '%';
        return Number(price.replace(sign, ''));
    },
    getPercentageCellColor(num) {
        return this.replaceSign(num) < 0 ? 'table-danger' : (this.replaceSign(num) > 0 ? 'table-success' : '');
    },
   
};

Main.init();