var quotesJson = "https://raw.githubusercontent.com/mdn/learning-area/master/accessibility/aria/quotes.json";

class Quote {
    constructor(author, text) {
        this.author = author;
        this.text = text;
    }
}

var currentQuoteIndex = 0;

var quotes = [
    new Quote('Marilyn Monroe ', 'I\'m selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can\'t handle me at my worst, then you sure as hell don\'t deserve me at my best.'),
    new Quote('Oscar Wilde', 'Be yourself; everyone else is already taken.'),
    new Quote('Albert Einstein', 'Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe.'),
    new Quote('Frank Zappa', 'So many books, so little time.'),
    new Quote('Bernard M. Baruch', 'Be who you are and say what you feel, because those who mind don\'t matter, and those who matter don\'t mind.'),
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