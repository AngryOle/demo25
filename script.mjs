import express from 'express'
import HTTP_CODES from './utils/httpCodes.mjs';

const server = express();
const port = (process.env.PORT || 8000);

server.set('port', port);
server.use(express.static('public'));

function getRoot(req, res, next) {
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
}

server.get("/", getRoot);

function getPoem(req, res) {
    const poem = `
        Roses are red,
        Violets are blue,
        These poems are so cheesy,
        and I think you're grate too.
    `;
    res.status(HTTP_CODES.SUCCESS.OK).send(poem).end();
}

server.get("/tmp/poem", getPoem);

function getRandomQuote(req, res) {
    const quotes = [
        "Now and then we had a hope that if we lived and were good, God would permit us to be pirates. - Mark Twain",
        "It's more fun to be a pirate than to join the navy. - Steve Jobs",
        "When a pirate grows rich enough, they make him a prince. - George R R Martin",
        "Merchant and pirate were for a long period one and the same person. Even today mercantile morality is really nothing but a refinement of piratical morality. - Friedrich Nietzsche",
        "There is more treasure in books than in all the pirate's loot on Treasure Island. - Walt Disney"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.status(HTTP_CODES.SUCCESS.OK).send(randomQuote).end();
}

server.get("/tmp/quote", getRandomQuote);

server.post("/tmp/sum/a/b", (req, res) => {
    const a = 31;
    const b = 80;
    const sum = a + b;

    res.status(HTTP_CODES.SUCCESS.OK).send(`The sum of ${a} and ${b} is ${sum}`).end();
});

server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});