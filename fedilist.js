#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
const not_dot_cz= [ //instance, které nekončí „.cz”, ale jsou české
	"ajtaci.club",
	"blogator.com",
	"boskovice.social",
	"czech.social",
	"fedi.skladka.net",
	"lgbtcz.social",
	"praha.social"
];

$.api()
.command("compare-last", "Porovná dva posledni snapshoty (defaultně jen „.cz”)")
.option("--all", "Zahrnout i ne-CZ.")
.option("--only-changes", "Vypíše instance jen pokud došlo od posledního snapshotu ke změně.")
.option("--limit [limit]", "Vypíše maximálně daný počet instancí (0 pro zrušení limitu)")
.option("--shift, -s", "prints nth compare (defaults to 0)")
.action(function({ all= false, shift= 0, ["only-changes"]: onlyChanges= false, limit= 0 }= {}){
	if(limit) limit+= 1;
	const [ name_previous, name_last ]= s.$()
		.ls("./mastodon-list--*.csv")
		.slice(-2 - shift);
	const [ previous, last ]= [ name_previous, name_last ]
		.map(fileToData)
		.map(data=> all ? data : data.filter(([ domain ])=> isCz(domain)));

	const css= echo.css`
		.h1 { color: lightblue; display: list-item; list-style: "# "; }
		.h2 { color: yellow; display: list-item; list-style: "## "; }
		.li { display: list-item; }
		.users { color: magenta; }
		.diff, .info { color: gray; }
	`;
	const number_style= new Intl.NumberFormat('cs-CZ', { notation: "compact" });
	echo(`%c${all?"Všechny":"„České”"} instance`, css.h1);
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
.command("snapshot <name>", "Stáhne aktuální `csv` soubor a uloží jej `./mastodon-list--name.csv`.")
.example("snapshot 2022-11-22")
.action(function(name){
	fetch("http://demo.fedilist.com/instance/csv?q=&ip=&software=mastodon&registrations=&onion=&sort=users")
	.then(r=> r.text())
	.then(function process(data){
		s.echo(data).to(`./mastodon-list--${name}.csv`);
		$.exit(0);
	});
})
.parse();

function usersCount(data){ return data.reduce((acc, row)=> acc+Number(row[3]), 0); }
function fileToData(file_name){ return s.cat(file_name).split("\n").map(line=> line.split(",")).filter(([ _, state ])=> state==="up"); }
function isCz(candidate){ return /\.cz$/.test(candidate) || not_dot_cz.indexOf(candidate) !== -1; }
function getDomainUsers(row){ if(!row) return [ null, 0 ]; const d= row[0]; const u= Number(row[3]); return [ d, u ]; }
