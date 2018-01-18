const Main = {
    version: 1.36,
    data: null,
    currentPage: '',
    currencies: {
        BTC: 0
    },
    negativeCount: 0,
    positiveCount: 0,
    selectElement: null,
    currentCurrency: 'BTC',
    init() {
        document.addEventListener('DOMContentLoaded', this.onLoaded.bind(this));
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
    onLoaded() {
        this.selectElement = document.querySelector('select');
        this.selectElement.addEventListener('change', this.onChange.bind(this));
        document.querySelector('#btc-input').addEventListener('keyup', this.onCurrencyKeyUp.bind(this));
        document.querySelector('#btc-input').addEventListener('paste', this.onCurrencyKeyUp.bind(this));
        document.querySelector('#usd-input').addEventListener('keyup', this.onCurrencyKeyUp.bind(this));
        document.querySelector('#usd-input').addEventListener('paste', this.onCurrencyKeyUp.bind(this));
        this.loadFile('data/coin_list.json', this.onComplete.bind(this));
    },
    onCurrencyKeyUp(event) {
        let btcInput = document.querySelector('#btc-input');
        let usdInput = document.querySelector('#usd-input');
        let value = 0;
        if (event.srcElement == btcInput) {
            value = Number(btcInput.value) * Number(this.replaceSign(this.currentCurrency.price,'$'));
            usdInput.value = value;
        } else {
            value = Number(usdInput.value) / Number(this.replaceSign(this.currentCurrency.price,'$'));
            btcInput.value = value;
        }
    },
    onChange(event) {
        let btcInput = document.querySelector('#btc-input');
        let usdInput = document.querySelector('#usd-input');
        this.currentCurrency = this.data[this.selectElement.selectedIndex];
        document.querySelector('#btc-input').placeholder = this.currentCurrency.symbol;
       btcInput.value = ' ';
       usdInput.value = ' ';
    },
    onComplete(data) {
        this.data = JSON.parse(data);
        console.log(this.data);

        let select = document.querySelector('select');
        this.data.forEach((item, index) => {
            let option = document.createElement('option');
            option.value = index;
            option.textContent = item.symbol;
            select.appendChild(option);
        });
        this.currentCurrency = this.data[0];
        document.querySelector('#loading').classList.add('hide');
    },
    replaceSign(price, sign) {
        if (!sign) sign = '%';
        return Number(price.replace(sign, ''));
    },
};

Main.init();