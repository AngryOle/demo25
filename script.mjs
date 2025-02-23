import express from 'express'
import session from 'express-session';
import HTTP_CODES from './utils/httpCodes.mjs';
import FileStore from 'session-file-store';
import BlackjackTrie from './backend/blackjack.mjs';

const server = express();
const port = process.env.PORT || 8000;

let decks = {};

const blackjackTrie = new BlackjackTrie();

server.set('port', port);
server.use(express.json());
server.use(express.static('public'));

const FileStoreInstance = FileStore(session);
server.use(session({
    store: new FileStoreInstance({ path: './sessions', logFn: function() {} }),
    secret: '4f8c0d8f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }
}));

server.use((req, res, next) => {
    console.log('Session:', req.session);
    next();
});

// Root route
function getRoot(req, res, next) {
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
}

server.get("/", getRoot);

// Random poem route
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

// Random quote route
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

// Sum of a and b route
server.post("/tmp/sum/a/b", (req, res) => {
    const a = 31;
    const b = 80;
    const sum = a + b;
    res.status(HTTP_CODES.SUCCESS.OK).send(`The sum of ${a} and ${b} is ${sum}`).end();
});

// Deck creation route (single POST /temp/deck)
server.post('/temp/deck', (req, res) => {
    const deckId = Math.random().toString(36).substr(2, 9);
    const deck = {
        deckId,
        cards: generateDeck(),
        usedCards: []
    };

    // Saves deckId in session
    req.session.deckId = deckId; 
    decks[deckId] = deck;

    res.status(HTTP_CODES.SUCCESS.OK).json({ deckId });
});

function generateDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let cards = [];
    suits.forEach(suit => {
        values.forEach(value => {
            cards.push({ suit, value });
        });
    });
    return cards;
}

server.get('/temp/deck/:deckId', (req, res) => {
    const { deckId } = req.params;
    const deck = decks[deckId];
    if (deck) {
        res.status(HTTP_CODES.SUCCESS.OK).json(deck);
    } else {
        res.status(HTTP_CODES.ERROR.NOT_FOUND).send('Deck not found');
    }
});

server.get('/temp/deck/session/card', (req, res) => {
    const deckId = req.session.deckId;
    if (!deckId || !decks[deckId]) {
        return res.status(HTTP_CODES.ERROR.NOT_FOUND).send('No deck found in session');
    }

    const deck = decks[deckId];
    if (deck.cards.length > 0) {
        const card = deck.cards.pop();
        deck.usedCards.push(card);
        res.status(HTTP_CODES.SUCCESS.OK).json(card);
    } else {
        res.status(HTTP_CODES.ERROR.NOT_FOUND).send('No cards left');
    }
});

// Draw a card route
server.get('/temp/deck/:deckId/card', (req, res) => {
    const { deckId } = req.params;
    const deck = decks[deckId];
    if (deck && deck.cards.length > 0) {
        const card = deck.cards.pop(); 
        deck.usedCards.push(card);  
        res.status(HTTP_CODES.SUCCESS.OK).json(card); 
    } else {
        res.status(HTTP_CODES.ERROR.NOT_FOUND).send('No cards left');
    }
});

// Shuffle cards route
server.patch('/temp/deck/shuffle/:deckId', (req, res) => {
    const { deckId } = req.params;
    const deck = decks[deckId];
    if (deck) {
        deck.cards = shuffle(deck.cards);  
        res.status(HTTP_CODES.SUCCESS.OK).send('Deck shuffled');
    } else {
        res.status(HTTP_CODES.ERROR.NOT_FOUND).send('Deck not found');
    }
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];  
    }
    return array;
}

// Blackjack
server.post('/blackjack', (req, res) => {
    const { playerName, gameState } = req.body;
    if (!playerName || !gameState) {
        return res.status(400).json({ error: "Player name and game state required" });
    }
    blackjackTrie.insert(playerName, gameState);
    res.status(201).json({ message: `Blackjack game started for ${playerName}` });
});

// status
server.get('/blackjack/:playerName', (req, res) => {
    const gameState = blackjackTrie.search(req.params.playerName);
    if (!gameState) return res.status(404).json({ error: "Game not found" });
    res.json(gameState);
});

// delete session
server.delete('/blackjack/:playerName', (req, res) => {
    blackjackTrie.delete(req.params.playerName);
    res.json({ message: `Game for ${req.params.playerName} deleted` });
});


server.listen(server.get('port'), function () {
    console.log('Server running on port', server.get('port'));
});