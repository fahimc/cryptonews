const RecommendationController = window.RecommendationController = {
    DATA_NAME: 'REC_DATA',
    TYPE: {
        STRONG_BUY: 'STRONG BUY',
        BUY: 'BUY'
    },
    data: null,
    success:0,
    failures:0,
    init() {
        this.data = localStorage.getItem(this.DATA_NAME);
        if (!this.data) {
            this.data = {};
        } else {
            this.data = JSON.parse(this.data);
        }
    },
    addRecommendations(item, realtimeChange, change15Mins, recommendation) {
        let obj = {
            realtimeChange: realtimeChange,
            change15Mins: change15Mins,
            recommendation: recommendation,
            price: item.price
        };
        if (this.data[item.symbol]) {
            this.data[item.symbol].priceHistory.push(obj);
        } else {
            this.data[item.symbol] = item;
            this.data[item.symbol].priceHistory = [];
            this.data[item.symbol].initialData = obj;
        }

        localStorage.setItem(this.DATA_NAME, JSON.stringify(this.data));
    },
    replaceSign(price, sign) {
        if (!sign) sign = '%';
        return Number(price.replace(sign, ''));
    },
    getHighestProfit(item){
        let highestPrice = 0;
        item.priceHistory.forEach((obj)=>{
          if(this.replaceSign(obj.price, '$') > highestPrice) highestPrice = this.replaceSign(obj.price, '$');
        });
         let profit = (((highestPrice - this.replaceSign(item.initialData.price, '$')) / this.replaceSign(item.initialData.price, '$')) * 100).toFixed(2);
        return profit;
    },
    getTemplate(item) {
      let highestProfit = this.getHighestProfit(item);
        let currentPrice = item.priceHistory[item.priceHistory.length - 1].price;
        let currentProfit = (((this.replaceSign(currentPrice, '$') - this.replaceSign(item.initialData.price, '$')) / this.replaceSign(item.initialData.price, '$')) * 100).toFixed(2);
        let classProfit = currentProfit > 0 ? 'btn-success' : (currentProfit < 0 ? 'btn-danger' : 'btn-secondary');
        let classHighestProfit = highestProfit > 0 ? 'btn-success' : 'btn-secondary';
        if(highestProfit > 0){
          this.success++;
        }else if(currentProfit < 0 ){
          this.failures++;
        }
        let template = `<div class="col">
                    <div class="card text-white bg-dark ">
                        <div class="card-body">
                            <h5 class="card-title">${item.name} <span class="badge badge-secondary badge-light">${item.symbol}</span></h5>
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
        let container = document.querySelector('#recommendation-card-container');
        container.innerHTML = '';
        let html = '';
        for (let key in this.data) {
            let item = this.data[key];
            html += this.getTemplate(item);
        }
        container.innerHTML = html;
        document.querySelector('#profitable_predictions').textContent = this.success;
        document.querySelector('#failed_predictions').textContent = this.failures;
    },
    destroy() {
        let container = document.querySelector('#recommendation-card-container');
        container.innerHTML = '';
    }
};