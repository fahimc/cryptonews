const RecommendationController = window.RecommendationController = {
    DATA_NAME: 'REC_DATA',
    APP_VERSION: 'APP_VERSION',
    TYPE: {
        STRONG_BUY: 'STRONG BUY',
        BUY: 'BUY'
    },
    data: null,
    success: 0,
    failures: 0,
    above10profitCollection: [],
    bestChange15: 0,
    bestChange1h: 0,
    init() {
        this.data = localStorage.getItem(this.DATA_NAME);
        if (!this.data) {
            this.data = {};
        } else {
            this.data = JSON.parse(this.data);
        }
        if( localStorage.getItem(this.APP_VERSION) !== Main.version)
        {
          localStorage.clear();
          this.data = {};
          localStorage.setItem(this.DATA_NAME, JSON.stringify(this.data));
          localStorage.setItem(this.APP_VERSION, Main.version);
        }
    },
    addRecommendations(item, realtimeChange, change15Mins, recommendation) {
        let obj = {
            realtimeChange: realtimeChange,
            change15Mins: change15Mins,
            recommendation: recommendation,
            price: item.price,
            timestamp: new Date().getTime()
        };
        if (this.data[item.symbol]) {
            this.data[item.symbol].priceHistory.unshift(obj);
        } else {
            this.data[item.symbol] = item;
            this.data[item.symbol].priceHistory = [obj];
            this.data[item.symbol].initialData = obj;
        }
        if(this.ObjectSize(this.data) > 200)this.resizeObject(this.data,200);
        localStorage.setItem(this.DATA_NAME, JSON.stringify(this.data));
    },
    ObjectSize(obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    },
    resizeObject(obj,limit){
      let count=0;
      for (key in obj) {
        if(count >= limit)delete obj[key];
        count++;
      }
    },
    replaceSign(price, sign) {
        if (!sign) sign = '%';
        return Number(price.replace(sign, ''));
    },
    getHighestProfit(item) {
        let highestPrice = 0;
        item.priceHistory.forEach((obj) => {
            if (this.replaceSign(obj.price, '$') > highestPrice) highestPrice = this.replaceSign(obj.price, '$');
        });
        let profit = (((highestPrice - this.replaceSign(item.initialData.price, '$')) / this.replaceSign(item.initialData.price, '$')) * 100).toFixed(2);
        return profit;
    },
    getTemplate(item) {
        let highestProfit = this.getHighestProfit(item);
        if (!item.priceHistory[item.priceHistory.length - 1]) return '';
        let currentPrice = item.priceHistory[item.priceHistory.length - 1].price;
        let currentProfit = (((this.replaceSign(currentPrice, '$') - this.replaceSign(item.initialData.price, '$')) / this.replaceSign(item.initialData.price, '$')) * 100).toFixed(2);
        let classProfit = currentProfit > 0 ? 'btn-success' : (currentProfit < 0 ? 'btn-danger' : 'btn-secondary');
        let classHighestProfit = highestProfit > 0 ? 'btn-success' : 'btn-secondary';
        if (highestProfit > 0) {
            this.success++;
            if (highestProfit > 10) this.above10profitCollection.push({ highestProfit: highestProfit, change15Mins: item.initialData.change15Mins, realtimeChange: item.initialData.realtimeChange });
        } else if (currentProfit < 0) {
            this.failures++;
        }
        let template = `<div class="col">
                    <div class="card text-white bg-dark ">
                        <div class="card-body">
                            <h5 class="card-title">${item.name} <span class="badge badge-secondary badge-light">${item.symbol}</span></h5>
                            <small class="card-subtitle mb-2 text-muted">Created at ${new Date()}</small>
                            <div class="container-fluid">
                                <button type="button" class="btn btn-primary">
                                    <small>Initial Change (1h)</small> <span class="badge badge-light">${item.initialData.realtimeChange}</span>
                                </button>
                                <button type="button" class="btn btn-primary">
                                    <small>Initial Change (15m)</small> <span class="badge badge-light">${item.initialData.change15Mins}</span>
                                </button>
                                <button type="button" class="btn btn-primary">
                                    <small>Initial Recommendation</small> <span class="badge badge-light">${item.initialData.recommendation}</span>
                                </button>
                                 <button type="button" class="btn btn-primary">
                                    <small>Initial Price</small> <span class="badge badge-light">${item.initialData.price}</span>
                                </button>
                            </div>
                            <div class="container-fluid">
                                <button type="button" class="btn ${classProfit}">
                                    <small>current profit</small> <span class="badge badge-light">${currentProfit}%</span>
                                </button>
                                <button type="button" class="btn btn-success">
                                    <small>current price</small> <span class="badge badge-light">${currentPrice}</span>
                                </button>
                                <button type="button" class="btn ${classHighestProfit}">
                                    <small>highest profit</small> <span class="badge badge-light">${highestProfit}%</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
        return template;
    },
    populate() {
        this.success = 0;
        this.failures = 0;
        this.above10profitCollection = [];
        let container = document.querySelector('#recommendation-card-container');
        container.innerHTML = '';
        let html = '';
        let total = 0;
        for (let key in this.data) {
            total++;
            let item = this.data[key];
            html += this.getTemplate(item);
        }
        container.innerHTML = html;
        let bestChange = this.calculateBestChange();
        this.bestChange15 = bestChange.average15mins;
        this.bestChange1h = bestChange.average1h;
        document.querySelector('#profitable_predictions').textContent = ((this.success / total) * 100).toFixed(2) + '%';
        document.querySelector('#failed_predictions').textContent = ((this.failures / total) * 100).toFixed(2) + '%';
        document.querySelector('#best_average').textContent = bestChange.average15mins.toFixed(2) + '%';
        document.querySelector('#best_average_1h').textContent = bestChange.average1h.toFixed(2) + '%';
        document.querySelector('#rec_date').textContent = new Date();
    },
    calculateBestChange() {
        let sum15min = 0;
        let sum1h = 0;
        this.above10profitCollection.forEach((item) => {
            sum15min += this.replaceSign(item.change15Mins);
            sum1h += this.replaceSign(item.realtimeChange);
        });
        let average15mins = sum15min / this.above10profitCollection.length;
        let average1h = sum1h / this.above10profitCollection.length;
        return {
            average15mins,
            average1h
        };
    },
    destroy() {
        let container = document.querySelector('#recommendation-card-container');
        container.innerHTML = '';
    }
};