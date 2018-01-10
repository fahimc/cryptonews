const Main = {
    init() {
        document.addEventListener('DOMContentLoaded', this.onLoaded.bind(this));
    },
    onLoaded() {
            this.loadCheapCoins();
    },
    loadCheapCoins() {
    	var file = 'data/cheapcoins_1h.json';
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = ()=> {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                this.onCheapCoinsLoaded(xobj.responseText);
            }
        };
        xobj.send(null);
    },
    onCheapCoinsLoaded(data){
    	data = JSON.parse(data);
    	console.log(data);
        this.populateCheapCoins(data);
        this.run();
    },
    populateCheapCoins(data){
        let tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach((item)=>{
                let row = document.createElement('TR');
                let class_24h = Number(item.percent_24h.replace('%','')) < 1 ? 'table-danger':  'table-success';
                let class_7d = Number(item.percent_7d.replace('%','')) < 1 ? 'table-danger':  'table-success';
                let class_1h = Number(item.percent_1h.replace('%','')) < 1 ? 'table-danger':  'table-success';
                let content = `<td>${item.name}</td><td>${item.symbol}</td><td>${item.marketCap}</td><td>${item.volume}</td><td class="${class_1h}">${item.percent_1h}</td><td class="${class_24h}">${item.percent_24h}</td><td class="${class_7d}">${item.percent_7d}</td><td>${item.price}</td>`;
                row.innerHTML = content;

                tbody.appendChild(row);
        });
    },
    run(){
        setTimeout(()=>{
            this.loadCheapCoins();
        },(60000 * 1));
    }
};

Main.init();