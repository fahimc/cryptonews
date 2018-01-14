const RecommendationController = window.RecommendationController = {
        DATA_NAME: 'REC_DATA',
        APP_VERSION: 'APP_VERSION',
        TYPE: {
            STRONG_BUY: 'STRONG BUY',
            BUY: 'BUY'
        },
        SAVE_BEST_CHANGE:'SAVE_BEST_CHANGE',
        data: null,
        success: 0,
        failures: 0,
        above10profitCollection: [],
        bestChange15: 0,
        bestChange24: 0,
        bestChange7: 0,
        bestChange1h: 0,
        init() {
            this.data = localStorage.getItem(this.DATA_NAME);
            if (!this.data) {
                this.data = {};
            } else {
                this.data = JSON.parse(this.data);
            }
            if (Number(localStorage.getItem(this.APP_VERSION)) !== Main.version) {
                localStorage.clear();
                this.data = {};
                localStorage.setItem(this.DATA_NAME, JSON.stringify(this.data));
                localStorage.setItem(this.APP_VERSION, Main.version);
            }
            let best = localStorage.getItem(this.SAVE_BEST_CHANGE);
            if(best){
              best = JSON.parse(best);
              this.bestChange15 = best.bestChange15;
              this.bestChange1h = best.bestChange1h;
              this.bestChange7 = best.bestChange7;
              this.bestChange24 = best.bestChange24;
            }
        },
        addRecommendations(item, realtimeChange, change15Mins, recommendation) {
            let obj = {
                realtimeChange: realtimeChange,
                change15Mins: change15Mins,
                recommendation: recommendation,
                change_24h: item.percent_24h,
                change_7d: item.percent_7d,
                price: item.price,
                timestamp: new Date().getTime()
            };
            let key = Main.getlastpartOfLink(item.link);
            if (this.data[key]) {
                this.data[key].priceHistory.push(obj);
            } else {
                this.data[key] = item;
                this.data[key].priceHistory = [obj];
                this.data[key].initialData = obj;
                this.data[key].timestamp = new Date().getTime();
            }
            this.data = this.resizeObject(this.data, 100);
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
        resizeObject(obj, limit) {
          let count=0;
            let datetime = new Date().getTime();
            for (key in obj) {
                if (Math.abs(datetime - obj[key].timestamp) >= 4000000||count>=limit) {
                    //console.log('deleted recommendation');
                    delete obj[key];
                }
                count++;
            }
            return obj;
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
            let highestProfit = item.highestProfit = this.getHighestProfit(item);
            if (!item.priceHistory[item.priceHistory.length - 1]) return '';
            let currentPrice = item.priceHistory[item.priceHistory.length - 1].price;
            let currentProfit = (((this.replaceSign(currentPrice, '$') - this.replaceSign(item.initialData.price, '$')) / this.replaceSign(item.initialData.price, '$')) * 100).toFixed(2);
            let classProfit = currentProfit > 0 ? 'btn-success' : (currentProfit < 0 ? 'btn-danger' : 'btn-secondary');
            let classHighestProfit = highestProfit > 0 ? 'btn-success' : 'btn-secondary';
            if (highestProfit > 10) this.above10profitCollection.push({ highestProfit: highestProfit, change15Mins: item.initialData.change15Mins, realtimeChange: item.initialData.realtimeChange, initialData: item.initialData });
            if (highestProfit > 0 && item.initialData.recommendation) {
                this.success++;
            } else if (currentProfit < 0 && item.initialData.recommendation) {
                this.failures++;
            }
            
            let ended = Main.findCoinInData(item.symbol) ? '' : '<span class="badge badge-danger">ENDED</span>';
            let template = `<div class="col">
                    <div class="card text-white bg-dark ">
                        <div class="card-body">
                            <h5 class="card-title"><a class="text-white" href="//coinmarketcap.com/${item.link}" target="_blank">${item.name}</a> <span class="badge badge-secondary badge-light">${item.symbol}</span> ${ended}</h5>
                            <small class="card-subtitle mb-2 text-muted">Created at ${new Date(item.initialData.timestamp)}</small>
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
                                    <small>Initial Change (24h)</small> <span class="badge badge-light">${item.initialData.change_24h}</span>
                                </button>
                                <button type="button" class="btn btn-primary">
                                    <small>Initial  Change (7d)</small> <span class="badge badge-light">${item.initialData.change_7d}</span>
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
        sortByDate() {
            let collection = [];
            for (let key in this.data) {

                collection.push(this.data[key]);
            }
            collection.sort(function(a, b) {
                return b.initialData.timestamp - a.initialData.timestamp;
            });
            return collection;
        },
        sortByHighest() {
            let endedcollection = [];
            let collection = [];
            for (let key in this.data) {
                let found = Main.findCoinInData(this.data[key].symbol)
                if(found){
                  collection.push(this.data[key]);
                }else{
                  endedcollection.push(this.data[key]);
                }
            }
            collection.sort(function(a, b) {
                return b.highestProfit - a.highestProfit;
            });
            endedcollection.sort(function(a, b) {
                return b.highestProfit - a.highestProfit;
            });
            return collection.concat(endedcollection);
        },
        populate() {
            this.success = 0;
            this.failures = 0;
            this.above10profitCollection = [];
            let container = document.querySelector('#recommendation-card-container');
            container.innerHTML = '';
            let html = '';
            let collection = this.sortByHighest();
            collection.forEach((item) => {
                html += this.getTemplate(item);
            });
            let total = collection.length;

        container.innerHTML = html;
        let bestChange = this.calculateBestChange();
        this.bestChange1h = bestChange.average1h;
        this.bestChange15 = bestChange.average15mins;
        this.bestChange24 = bestChange.average24h;
        this.bestChange7 = bestChange.average7d;
        localStorage.setItem(this.SAVE_BEST_CHANGE,JSON.stringify({
          bestChange1h:this.bestChange1h,
          bestChange15:this.bestChange15,
          bestChange24:this.bestChange24,
          bestChange7:this.bestChange7
        }));
        document.querySelector('#profitable_predictions').textContent = ((this.success / total) * 100).toFixed(2) + '%';
        document.querySelector('#failed_predictions').textContent = ((this.failures / total) * 100).toFixed(2) + '%';
        document.querySelector('#best_average').textContent = bestChange.average15mins.toFixed(2) + '%';
        document.querySelector('#best_average_1h').textContent = bestChange.average1h.toFixed(2) + '%';
        document.querySelector('#best_average_24h').textContent = bestChange.average24h.toFixed(2) + '%';
        document.querySelector('#best_average_7d').textContent = bestChange.average7d.toFixed(2) + '%';
        document.querySelector('#rec_date').textContent = new Date();
    },
    calculateBestChange() {
        let sum15min = 0;
        let sum1h = 0;
        let sum24h = 0;
        let sum7d = 0;
        this.above10profitCollection.forEach((item) => {
            sum15min += this.replaceSign(item.change15Mins);
            sum1h += this.replaceSign(item.realtimeChange);
            sum24h += this.replaceSign(item.initialData.change_24h);
            sum7d += this.replaceSign(item.initialData.change_7d);
        });
        let average15mins = this.above10profitCollection.length ? sum15min / this.above10profitCollection.length : 0;
        let average1h = this.above10profitCollection.length ? sum1h / this.above10profitCollection.length : 0;
        let average24h = this.above10profitCollection.length ? sum24h / this.above10profitCollection.length : 0;
        let average7d = this.above10profitCollection.length ? sum7d / this.above10profitCollection.length : 0;
        return {
            average15mins,
            average1h,
            average24h,
            average7d
        };
    },
    destroy() {
        let container = document.querySelector('#recommendation-card-container');
        container.innerHTML = '';
    }
};