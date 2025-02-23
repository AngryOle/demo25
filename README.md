# Express web server prosjekt

Demonstrasjon av en API som håndterer GET- og POST- forespørsler for å returnere et dikt, sitat, og sum av tall.

## FUNKSJONER:
### GET / - Returnerer "Hello World"
### GET /tmp/poem - Returnerer et dikt.
### GET /tmp/quote - Returnerer et tilfeldig sitat.
### POST /tmp/sum/a/b/ - Returnerer summen av to tall. Disse tallene er hard-kodet til å være: a=31 og b=80. Disse blir da lagt sammen i sum. 
Var ikke sikker ut i fra oppgaveteksten om tall verdiene for a og b skulle være definert på forhånd, slik at ved bruk av "/tmp/sum/a/b" at det skulle vise en sum, eller om brukeren skal kunne definere a og b slik at /tmp/sum/:a/:b (der a og b blir definert av bruker). 
Eventuelt om jeg har gjort dette feil, kommer jeg til å endre koden slik at man kan bruke for eks. http://localhost:8000/tmp/sum/31/80 for å få summen av 31 + 80 (a + b).
### POST /temp/deck - Oppretter en ny deck, lagrer deckId i session, og returnerer deckId.
### GET /temp/deck/:deckId - Henter en deck basert på deckId (f.eks. http://localhost:8000/temp/deck/abc123).
### GET /temp/deck/session/card - Trekker et kort fra deck som er lagret i session.
### GET /temp/deck/:deckId/card - Trekker et kort fra det spesifiserte decket.
### PATCH /temp/deck/shuffle/:deckId - Stokker om kortene i det spesifiserte decket.
### POST /blackjack - Starter et nytt blackjack-game. Krever at du sender playerName og gameState i JSON-format.
### GET /blackjack/:playerName - Henter blackjack-spillstatus for én spiller (f.eks. http://localhost:8000/blackjack/Alice).
### DELETE /blackjack/:playerName - Sletter blackjack-spillsesjonen for den angitte spilleren.

## BLACKJACK BESKRIVELSE
### For å kunne opprette et BlackJack game for f.eks en spiller som heter "Alice", må POST-forespørselen sendes til http://localhost:8000/blackjack og se slik ut: 
"{
  "playerName": "Alice",
  "gameState": {
    "score": 15,
    "cards": ["10H", "5S"]
  }
}
### Dermed vil "http://localhost:8000/blackjack/Alice" returnere den lagrede spillet for "Alice"

## URL:
### http://localhost:8000/ - "Hello World"
### http://localhost:8000/tmp/poem - Dikt
### http://localhost:8000/tmp/quote - tilfeldig sitat
### http://localhost:8000/tmp/sum/a/b
### http://localhost:8000/temp/deck
### http://localhost:8000/blackjack
