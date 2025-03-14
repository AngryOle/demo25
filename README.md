# Express web server prosjekt - GAMBLING HUB!

## RENDER URL
https://demo25-ole.onrender.com/

## **Funksjoner**  

### **Hjemmeside**
- **GET /** - Laster inn startsiden. Hoved navigasjonssiden.

### **Dikt & Sitat**
- **GET /tmp/poem** - Returnerer et tilfeldig dikt.  
- **GET /tmp/quote** - Returnerer et tilfeldig sitat.  

### **Kortspill - Blackjack**  
- **POST /blackjack/start** - Starter et nytt blackjack-spill (krever innlogging og bet).  
- **PUT /blackjack/play/:sessionId** - Trekker et kort for spilleren.  
- **PUT /blackjack/stand/:sessionId** - Spiller velger å "stå" og dealer må trekke.  

**Betting-system:**  
- Spilleren har "credits" lagret i databasen.  
- Credits trekkes når bet plasseres og oppdateres etter gevinst/tap.  

### **Kortspill - Deck Game (tidligere innlevering)**  
- **POST /temp/deck** - Oppretter en ny kortstokk og returnerer deckId.  
- **GET /temp/deck/:deckId/card** - Trekker et kort fra det spesifiserte decket.  
- **PATCH /temp/deck/shuffle/:deckId** - Stokker om kortene i en eksisterende kortstokk.  

### **Brukerautentisering & Profil**  
- **POST /user/register** - Registrerer en ny bruker (brukernavn + passord).  
- **POST /user/login** - Logger inn brukeren og oppretter en session.  
- **GET /user/session** - Henter innlogget brukers informasjon (brukernavn & kreditter).  
- **POST /user/logout** - Logger ut brukeren og sletter session.  

---

## **Hvordan spille Blackjack?**  
1. **Registrer deg / logg inn**  
2. **Sett en bet**  
3. **Start spillet**  
4. **Trekk kort (Hit) eller stå (Stand)**  
5. **Vanlige Blackjack regler. Du prøver å komme deg nærmest mulig 21 (alt over 21 er en bust (tap)). Dealer må trekke til dealer har 17 eller høyere. Hvis dealer får over 21 eller du har høyere tall enn dealer (som er under 21 eller 21) så vinner du! Du får 2x creditsene du brukte som bet**
6. **NB! Alle brukere starter med 10000 credits når de registrerer seg!**

| **Route** | **Beskrivelse** |
|-----------|----------------|
| `/` | Laster startsiden |
| `/tmp/poem` | Viser et dikt |
| `/tmp/quote` | Viser et tilfeldig sitat |
| `/blackjack/start` | Starter en blackjack-runde |
| `/blackjack/play/:sessionId` | Trekker kort i blackjack |
| `/blackjack/stand/:sessionId` | Spiller står i blackjack |
| `/temp/deck` | Oppretter ny kortstokk |
| `/temp/deck/:deckId/card` | Trekker et kort |
| `/user/register` | Registrerer ny bruker |
| `/user/login` | Logger inn bruker |
| `/user/session` | Henter innlogget brukers data |
