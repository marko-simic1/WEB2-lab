# WEB2 – Lotto 6/45 Aplikacija

Ovo je projekt iz kolegija **Napredni razvoj programske potpore za web**. Aplikacija omogućava prijavu korisnika preko Auth0 (OIDC), unos loto listića, generiranje QR koda, spremanje podataka u PostgreSQL te administraciju kola putem Auth0 M2M autorizacije (client credentials).

## Funkcionalnosti

### Korisnički dio (OIDC)
- Prijava korisnika putem Auth0 (OpenID Connect)
- Pregled trenutnog kola (status, broj uplata, izvučeni brojevi)
- Unos listića (6–10 brojeva, 1–45)
- Prikaz pojedinog listića (odabrani brojevi + izvučeni brojevi)
- QR kod koji vodi na stranicu s listićem

### Administratorski dio (M2M)
Putem Auth0 M2M aplikacije i client_credentials tokena moguće je:

- | POST | `/new-round` | otvara novo kolo |
- | POST | `/close` | zatvara trenutno kolo |
- | POST | `/store-results` | sprema izvučene brojeve (moguće samo nakon zatvaranja kola i ako rezultati još ne postoje) |

Sve tri rute vraćaju HTTP status 204 u slučaju uspjeha.

Aplikacija je postavljena na Render i dostupna na:

**URL aplikacije:**  
https://web2-lab-76rk.onrender.com/

Korisnik koji se može prijaviti i uplatiti listić:

