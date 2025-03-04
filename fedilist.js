#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch */
const not_dot_cz= [ //instance, které nekončí „.cz”, ale jsou české
	"ajtaci.club",
	"blogator.com",
	"boskovice.social",
	"czech.social",
	"czech-press.eu",
	"fedi.skladka.net",
	"hlidacstatu.social",
	"kocour.club",
	"lgbtcz.social",
	"mastodon.darksheep.social",
	"mastodon.vyboh.net",
	"praha.social",
	"propulse.club",
	"social.filik.eu",
	// "zpravobot.news" ?? boti, ale ti jsou i jinde
];

$.api()
.command("compare-last", "Porovná dva posledni snapshoty (defaultně jen „.cz”)")
.option("--filter", "Zahrnout i ne-CZ. Možnosti `cz`, `sk` a kombinace s `+`, jinak `*` pro vše", "cz")
.option("--only-changes", "Vypíše instance jen pokud došlo od posledního snapshotu ke změně.")
.option("--limit [limit]", "Vypíše maximálně daný počet instancí (0 pro zrušení limitu)")
.option("--shift, -s", "prints nth compare (defaults to 0)")
.action(function({ filter, shift= 0, ["only-changes"]: onlyChanges= false, limit= 0 }= {}){
	if(limit) limit+= 1;
	filter= filter==="*" ? "*" : filter.split("+");
	const [ name_previous, name_last ]= s.$()
		.ls("./mastodon-list--*.csv")
		.slice(-2 - shift);
	const [ previous, last ]= [ name_previous, name_last ]
		.map(fileToData)
		.map(data=> filter==="*" ? data : data.filter(([ domain ])=> ( filter.includes("cz") && isCz(domain) )  || ( filter.includes("sk") && domain.endsWith(".sk") )));

	const css= echo.css`
		.h1 { color: lightblue; display: list-item; list-style: "# "; }
		.h2 { color: yellow; display: list-item; list-style: "## "; }
		.li { display: list-item; }
		.users { color: magenta; }
		.diff, .info { color: gray; }
	`;
	const number_style= new Intl.NumberFormat('cs-CZ', { notation: "compact", maximumFractionDigits: 2 });
	const title= filter==="*" ? "Všechny" : filter.map(l=> l==="cz" ? "„České”" : ( l==="sk" ? "„Slovenské”" : "???" )).join("&");
	echo(`%c${title} instance`, css.h1);
	echo("%cUživatelé za instanci:", css.h2);
	for(const row of last){
		const [ domain, users_now ]= getDomainUsers(row);
		const [ , users_prev ]= getDomainUsers(previous.find(([ domain_prev ])=> domain_prev===domain));
		const diff= users_now-users_prev;
		if(limit && !--limit) break;
		if(onlyChanges && diff===0) continue;
		echo(`%c${domain}: %c~${number_style.format(users_now)}%c (%crozdíl ~${number_style.format(diff)}%c)`,
			css.li, css.users, css.unset, css.diff, css.unset);
	}
	
	const [ all_previous, all_last ]= [ previous, last ].map(usersCount);
	echo("%cUživatelé celkem:", css.h2);
	echo(`%c%c~${number_style.format(all_last)}%c (%crozdíl ~${number_style.format(all_last-all_previous)}%c)`,
		css.li, css.users, css.unset, css.diff, css.unset);
	echo(`%cInfo – porovnávají se snapshoty:`, css.h2+css.info);
	echo(`%c${name_last}`, css.info+css.li);
	echo(`%c${name_previous}`, css.info+css.li);
	$.exit(0);
})
.command("snapshot [name]", "Stáhne aktuální `csv` soubor a uloží jej `./mastodon-list--name.csv`.")
.option("--commit", "Rovnou i zagituje")
.example("snapshot 2022-11-22")
.action(function(name= (new Date()).toISOString().replace(/:\d\d\..*/, ""), { commit= false }){
	fetch("http://demo.fedilist.com/instance/csv?q=&ip=&software=mastodon&registrations=&onion=&sort=users")
	.then(r=> r.text())
	.then(function process(data){
		const file= `./mastodon-list--${name}.csv`;
		s.echo(data).to(file);
		if(commit) gitCommit(file);
		$.exit(0);
	});
})
.parse();

function usersCount(data){ return data.reduce((acc, row)=> acc+Number(row[3]), 0); }
function fileToData(file_name){ return s.cat(file_name).split("\n").map(line=> line.split(",")).filter(([ _, state ])=> state==="up"); }
function isCz(candidate){ return /\.cz$/.test(candidate) || not_dot_cz.indexOf(candidate) !== -1; }
function getDomainUsers(row){ if(!row) return [ null, 0 ]; const d= row[0]; const u= Number(row[3]); return [ d, u ]; }

export function gitCommit(file, des= "not specified"){
	echo("Diff to save");
	s.run`git config user.name "Bot"`
	s.run`git config user.email "${"zc.murtnec@naj.elrdna".split("").reverse().join("")}"`
	s.run`git add ${file}`;
	s.run`git commit -m "Updated ${file} by bot – ${des}"`;
	s.run`git push`;
	s.run`git config --remove-section user`
}
