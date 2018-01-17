const cheerio = require("cheerio-req");
const fs = require("fs");
const CoinMarketCap = {
    getAllCoins(callback) {
        cheerio("https://coinmarketcap.com/all/views/all/", (err, $) => {
            if(err)
            {
                 if (callback) callback(null);
                return;
            }
            let data = [];
            let rows = $('tr').each((i, elem) => {
                let item = {};
                let symbol = $(elem).find('.currency-symbol a').text();
                if (!symbol) return;
                let name = $(elem).find('.currency-name-container').text();
                let link = $(elem).find('.currency-name-container').attr('href');
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
                    percent_7d,
                    link: link
                };
                data.push(item);
            });

            if (callback) callback(data);
        });
    },
    getNewCoins(callback) {
        console.log('getNewCoins');
        cheerio("https://coinmarketcap.com/new/", (err, $) => {
            if(err)
            {
                 if (callback) callback([]);
                return;
            }
            let data = [];
            let rows = $('tr').each((i, elem) => {
                let item = {};
                let symbol = $(elem).find('td:nth-child(2)').text().replace(/\n/g, '').trim();
                if (!symbol) return;
                let name = $(elem).find('td.currency-name').text().replace(/\n/g, '').trim();
                let link = $(elem).find('td.currency-name a').attr('href').replace(/\n/g, '').trim();
                let marketCap = $(elem).find('td:nth-child(4)').text().replace(/\n/g, '').trim();
                let price = $(elem).find('td:nth-child(5)').text().replace(/\n/g, '').trim();
                let volume = $(elem).find('td:nth-child(7)').text().replace(/\n/g, '').trim();
                let supply = $(elem).find('td:nth-child(6)').text().replace(/\n|\s/g, '').trim();
                let percent_24h = $(elem).find('td:nth-child(8)').text().replace(/\n/g, '').trim();
                let added = $(elem).find('td:nth-child(3)').text().replace(/\n/g, '').trim();
               
                item = {
                    name,
                    symbol,
                    marketCap,
                    added,
                    price,
                    volume,
                    supply,
                    percent_24h,
                    link: link
                };
                if(added == 'Today' || added == '1 day ago')data.push(item);
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
            if (price < 0.01) {
                cheapCoins.push(item);
            }
        });
        return cheapCoins;
    }
};
module.exports = CoinMarketCap;