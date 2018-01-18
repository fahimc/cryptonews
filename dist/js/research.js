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
    onLoaded() {
        document.querySelector('#loading').classList.remove('hide');
        Tabletop.init({
            key: '1Gx8WJQf9x3HvdYmYX7dkgdvTvv_69sqBUa0G4F_gjTc',
            callback: this.onComplete.bind(this),
            simpleSheet: true
        })
    },
    onComplete(data) {
        let tr = document.querySelector('.row');
        data.forEach((item) => {
        console.log(item);

            let template = `<div class="col-lg-4 ">
                    <div class="card bg-light" >
                    <div class="card-body">
                    <h5>${item.Name} <span class="badge badge-dark text-white">${item.Symbol}</span></h5>
                    <small>${item.Timestamp}</small>
                    <p>${item['Whats you opinion?']}</p>
                    <div class="list-group text-white">
                    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start ">
                            <div class="d-flex w-100 justify-content-between">
                                <small>Initial Price</small>
                            </div>
                            <p class="mb-1">$${item['Price (at present)']}</p>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action flex-column align-items-start ">
                            <div class="d-flex w-100 justify-content-between">
                                <small>What type of investment is it?</small>
                            </div>
                            <p class="mb-1">${item['What the type of investment?']}</p>
                        </a>
                         <a href="#" class="list-group-item list-group-item-action flex-column align-items-start ">
                            <div class="d-flex w-100 justify-content-between">
                                <small>What do you like about this coin?</small>
                            </div>
                            <p class="mb-1">${item['What do you like about this coin?']}</p>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action flex-column align-items-start ">
                            <div class="d-flex w-100 justify-content-between">
                                <small>Whats you prediction?</small>
                            </div>
                            <p class="mb-1">${item['Whats you prediction?']}</p>
                        </a>
                    </div>
                    <br>
                    <p><a class="btn btn-primary" href="${item['Website URL']}" role="button" target="_blank">View website &raquo;</a></p>
                </div>
                </div>
                </div>`;

                tr.innerHTML +=template;
        });
        document.querySelector('#loading').classList.add('hide');
    }
};

Main.init();