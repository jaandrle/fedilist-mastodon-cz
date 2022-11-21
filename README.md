Jen narychlo spíchnutý script pro stahování/porovnání přírustku uživatelů dle [fedilist](http://demo.fedilist.com/instance?q=&ip=&software=mastodon&registrations=&onion=).
Tyto záznamy jsou získávány botem, který prochází fediversum (viz [FediList.com](https://fedilist.com/) & [@fedilist@freespeechextremist](https://freespeechextremist.com/users/fedilist)).
Bohužel, autor zatím nevydal zdrojové kódy – i proto bych bral data opradu jen orientačně.

Vl. také slouží k testování [jaandrle/nodejsscript at dev/0.9](https://github.com/jaandrle/nodejsscript/tree/dev/0.9):
- instalace: `npm install https://github.com/jaandrle/nodejsscript#dev/0.9 --location=global`
- spuštění (resp. zobrazení nápovědy): `./fedilist.js --help`

Defaultně zpracovává instance na „.cz” doméně + např. „czech.social” (všechny přidané instance jsou v poli [`not_dot_cz`](./fedilist.js#L3)).
