[Nolog](nolog.cz) má také statistiky → [vybrané české instance](https://grafana.nolog.cz/public-dashboards/211b01cf316b4e1fbcb17ca0f24cd0b8?orgId=0).

Jen narychlo spíchnutý script pro stahování/porovnání přírustku uživatelů dle [fedilist](http://demo.fedilist.com/instance?q=&ip=&software=mastodon&registrations=&onion=).
Tyto záznamy jsou získávány botem, který prochází fediversum (viz [FediList.com](https://fedilist.com/) & [@fedilist@freespeechextremist](https://freespeechextremist.com/users/fedilist)).
Bohužel, autor zatím nevydal zdrojové kódy – i proto bych bral data opradu jen orientačně.

Vl. také slouží k testování [jaandrle/nodejsscript](https://github.com/jaandrle/nodejsscript):
- instalace: `npm install nodejsscript --location=global`
- spuštění (resp. zobrazení nápovědy): `./fedilist.js --help`

Defaultně zpracovává instance na „.cz” doméně + např. „czech.social” (všechny přidané instance jsou v poli [`not_dot_cz`](./fedilist.js#L3)).
