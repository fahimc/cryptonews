const Main = {
    version: 1.36,
    cheapCoinData: null,
    currentPage: '',
    currencies: {
        BTC: 0
    },
    negativeCount:0,
    positiveCount:0,
    init() {
        document.addEventListener('DOMContentLoaded', this.onLoaded.bind(this));
    },
    onLoaded() {
        document.querySelector('#loading').classList.remove('hide');
        this.loadFile('data/news.json', this.onComplete.bind(this));
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
        this.run();
    },
    populateTable(data) {
        let tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach((item) => {
            
            let row = document.createElement('TR');

            let cellClass =  item.sentiment > 0 ? 'table-success' : (item.sentiment < 0 ? 'table-danger' : 'normal');
            row.classList.add(cellClass);
            let content = `<td><a class="text-white" href="${item.item.link}" target="_blank" >${item.title}</a><br><small>${new Date(item.item.date)}</small></td>
            <td>${item.sentiment}</td>`;
            row.innerHTML = content;

            tbody.appendChild(row);

            if(item.sentiment < 0)this.negativeCount++;
            if(item.sentiment > 0)this.positiveCount++;
        });
        document.querySelector('#positive').textContent = this.positiveCount;
        document.querySelector('#negative').textContent = this.negativeCount;
        document.querySelector('#loading').classList.add('hide');
    },
    replaceSign(price, sign) {
        if (!sign) sign = '%';
        return Number(price.replace(sign, ''));
    },
    getPercentageCellColor(num) {
        return this.replaceSign(num) < 0 ? 'table-danger' : (this.replaceSign(num) > 0 ? 'table-success' : '');
    },
    run(){
        setTimeout(this.onLoaded.bind(this),60000);
    }
};

Main.init();