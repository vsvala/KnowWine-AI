# Commit-käytäntö

Commit kertoo nopeasti mitä muuttui, missä ja miksi. Projektissa käytetään
[Conventional Commits](https://www.conventionalcommits.org/) -standardia.

## Perusmuoto

```
<type>(<scope>): <lyhyt kuvaus>
```

Esimerkkejä:

- `feat(auth): add refresh token rotation`
- `fix(mywines): handle duplicate wine name as 400`
- `refactor(winelist): drop WineListContext, use useWineList hook`
- `test(auth): add refresh token tests`
- `docs(catalogue): document pagination`
- `chore(deps): update React dependencies`

## Type

| Type       | Käyttö                                     |
| ---------- | ------------------------------------------- |
| `feat`     | uusi toiminnallisuus                        |
| `fix`      | bugikorjaus                                 |
| `refactor` | koodin rakenne muuttuu, toiminnallisuus ei  |
| `test`     | testejä                                     |
| `docs`     | dokumentaatio                               |
| `perf`     | suorituskykyparannus                        |
| `chore`    | ylläpito, riippuvuudet, config              |
| `build`    | build-järjestelmä                           |
| `ci`       | CI/CD                                       |
| `style`    | formatointi, ei toiminnallista muutosta     |

## Scope

Scope kertoo mihin sovelluksen osaan muutos kohdistuu. Tässä projektissa
esimerkiksi:

- `auth` — kirjautuminen, tokenit (`services/loginService.js`, `models/refreshToken.js`)
- `users` — käyttäjähallinta
- `mywines` — oman viinilistan hallinta
- `winelist` — viinilistanäkymä (front)
- `catalogue` — viinikatalogi, sivutus
- `grapeminds` — GrapeMinds-integraatio
- `db` — tietokantakyselyt, migraatiot
- `deps` — riippuvuuspäivitykset

Pidä skoopit johdonmukaisina — tarkista aiemmat committit
(`git log --oneline`) ennen uuden skoopin keksimistä.

## Automaattinen laadunvarmistus

Ennen jokaista committia (riippumatta siitä committaatko itse vai Claude
Code puolestasi) ajetaan automaattisesti lint, tyyppitarkistus, testit,
secrets-tarkistus, `npm audit` ja kevyt AI-koodikatselmointi. Katso
[`docs/ai-commit-quality-gate.md`](docs/ai-commit-quality-gate.md)
miten järjestelmä toimii, miten se otetaan käyttöön uudessa kloonissa, ja
mitkä ovat sen ohitusmekanismit.
