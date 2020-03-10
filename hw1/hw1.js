var quotesJson = "https://raw.githubusercontent.com/mdn/learning-area/master/accessibility/aria/quotes.json";

class Quote {
    constructor(author, text) {
        this.author = author;
        this.text = text;
    }
}

var currentQuoteIndex = 0;

var quotes = [
    new Quote('Big Smoke', 'ALL YOU HAD TO DO WAS FOLLOW THE DAMN TRAIN CJ!'),
    new Quote('Alexander Hvatov', 'As you maybe have noticed, we have a new article, ' +
        'concerning waves in a periodic elastic layer with a reduced-order models approximation.'),
    new Quote('Louis C.K.', 'I finally have the body I want. ' +
        'It\'s easy actually, you just have to want a really shitty body')
];


function nextQuote() {
    changeQuote(quotes[currentQuoteIndex]);

    currentQuoteIndex ++;

    if (currentQuoteIndex >= quotes.length) currentQuoteIndex = 0;
}

function changeQuote(quote) {
    document.getElementById("quote").innerText = quote.text;
    document.getElementById("author").innerText = quote.author;
}

function quotesFromUrl() {
    fetch(quotesJson)
        .then(data => {
            return data.json()
        })
        .then(res => {

            var quotes = parsedQuotesFromJson(res);
            var quoteIdx = Math.floor(Math.random() * quotes.length);
            changeQuote(quotes[quoteIdx]);
        })
}



function parsedQuotesFromJson(json) {
    return json.map(q => new Quote(q.author, q.quote));
}