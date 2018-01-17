let fs = require('fs');
let GoogleNews = require('google-news');
let sentimentAnalysis = require('sentiment-analysis');
let googleNews;

const GoogleNewsService = {
    collection: [],
    SEARCH_TERMS: [
        'bitcoin',
        'cryptocurrency',
        'ripple xrp',
        'ethereum'
    ],
    init() {
        googleNews = new GoogleNews();
        this.createStreams();
        this.run(true);
    },
    createStreams() {
        this.SEARCH_TERMS.forEach((term) => {
            googleNews.stream(term, this.onStream.bind(this));
        });
    },
    onStream(stream) {
        stream.on(GoogleNews.DATA, this.onData.bind(this));
        stream.on(GoogleNews.ERROR, this.onError.bind(this));
    },
    onData(data) {
        this.collection.push({
            title: data.title,
            item: data,
            sentiment: sentimentAnalysis(data.title)
        });
    },
    onError(error) {
        //console.log('Error Event received... ' + error);
    },
    run(firstTime) {
        setTimeout(this.saveData.bind(this), firstTime ? 3000 : 60000);
    },
    saveData() {
        if (!this.collection.length) {
            this.run();
            return;
        }
        this.collection.sort((itemA,itemB)=>{
                if(new Date(itemB.item.date) > new Date(itemA.item.date))return true;
        });
        fs.writeFile(`dist/data/news.json`, JSON.stringify(this.collection, null, 2), (err) => {
            if (err) throw err;
            this.removeOldArticles();
            //this.collection = [];
            this.run();
            console.log('saved news');
        });
    },
    removeOldArticles() {
        let date = new Date();
        var timestamp = new Date().getTime() - (1 * 24 * 60 * 60 * 1000);
        for (let a = 0; a < this.collection.length; ++a) {
            let item = this.collection[a];
            let itemTimestamp = new Date(item.item.date).getTime();
            if (itemTimestamp < timestamp) {
                this.collection.splice(a, 1);
                a--;
            }

        }
    }
};

module.exports = GoogleNewsService;