const Main = {
    version: 1.36,
    cheapCoinData: null,
    currentPage: '',
    currencies: {
        BTC: 0
    },
    negativeCount: 0,
    positiveCount: 0,
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
      
        this.loadFile('data/coin_list.json', this.onComplete.bind(this));
    },
    onComplete(data) {
        data = JSON.parse(data);
        console.log(data);

        let select  = document.querySelector('select');
        data.forEach((item,index)=>{
            let option = document.createElement('option');
            option.value = index;
            option.textContent = item.symbol;
            select.appendChild(option);
        });
          document.querySelector('#loading').classList.add('hide');
    }
};

Main.init();