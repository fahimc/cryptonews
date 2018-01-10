const cheerio = require("cheerio-req");
const CoinMarketCap = {
    getAllCoins(callback) {
        cheerio("https://coinmarketcap.com/all/views/all/", (err, $) => {
            let data = [];
            let rows = $('tr').each((i, elem) => {
                let item = {};
                let symbol = $(elem).find('.currency-symbol a').text();
                if (!symbol) return;
                let name = $(elem).find('.currency-name-container').text();
                let marketCap = $(elem).find('.market-cap').text().replace(/\n/g, '').trim();
                let price = $(elem).find('.price').text();
                let volume = $(elem).find('.volume').text();
                let percent_1h = $(elem).find('.percent-1h').text();
                let percent_24h = $(elem).find('.percent-24h').text();
                let percent_7d = $(elem).find('.percent-7d').text();
                item = {
                    name,
                    symbol,
                    marketCap,
                    price,
                    volume,
                    percent_1h,
                    percent_24h,
                    percent_7d
                };
                data.push(item);
            });

            if (callback) callback(data);
        });
    },
    sortCoins1hChange(data) {
        data.sort((a, b) => {
            return Number(b.percent_1h.replace('%', '')) - Number(a.percent_1h.replace('%', ''));
        });
        return data;
    },
    findCheapCoinsMovingUp(data) {
        let cheapCoins = [];
        data = CoinMarketCap.sortCoins1hChange(data);
        data.forEach((item) => {
            let price = Number(item.price.replace('$', ''));
            let change = Number(item.percent_1h.replace('%', ''));
            if (price < 0.01 && change > 0.3) {
                cheapCoins.push(item);
            }
        });
        return cheapCoins;
    }
};

module.exports = CoinMarketCap;