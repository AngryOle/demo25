# Express web server prosjekt

Demonstrasjon av en API som håndterer GET- og POST- forespørsler for å returnere et dikt, sitat, og sum av tall.

## FUNKSJONER:
### GET / - Returnerer "Hello World"
### GET /tmp/poem - Returnerer et dikt.
### GET /tmp/quote - Returnerer et tilfeldig sitat.
### POST /tmp/sum/a/b/ - Returnerer summen av to tall. Disse tallene er hard-kodet til å være: a=31 og b=80. Disse blir da lagt sammen i sum. 
Var ikke sikker ut i fra oppgaveteksten om tall verdiene for a og b skulle være definert på forhånd, slik at ved bruk av "/tmp/sum/a/b" at det skulle vise en sum, eller om brukeren skal kunne definere a og b slik at /tmp/sum/:a/:b (der a og b blir definert av bruker). 
Eventuelt om jeg har gjort dette feil, kommer jeg til å endre koden slik at man kan bruke for eks. http://localhost:8000/tmp/sum/31/80 for å få summen av 31 + 80 (a + b).

## URL:
### http://localhost:8000/ - "Hello World"
### http://localhost:8000/tmp/poem - Dikt
### http://localhost:8000/tmp/quote - tilfeldig sitat
### http://localhost:8000/tmp/sum/a/b
