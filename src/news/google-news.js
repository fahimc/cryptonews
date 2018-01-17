let fs = require('fs');
let GoogleNews = require('google-news');
let sentimentAnalysis = require('sentiment-analysis');
let googleNews;

const GoogleNewsService = {
    collection:[],
    SEARCH_TERMS: [
        'bitcoin',
        'cryptocurrency',
        'ripple xrp'
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
            title:data.title,
            item:data,
            sentiment:sentimentAnalysis(data.title)
        });
    },
    onError(error) {
         //console.log('Error Event received... ' + error);
    },
    run(firstTime){
        setTimeout(this.saveData.bind(this),firstTime?3000:60000);
    },
    saveData(){
        if(!this.collection.length) {
            this.run();
            return;
        }
        fs.writeFile(`dist/data/news.json`, JSON.stringify(this.collection, null, 2), (err) => {
            if (err) throw err;
            this.collection = [];
            this.run();
            console.log('saved news');
        });
    }
};

module.exports = GoogleNewsService;