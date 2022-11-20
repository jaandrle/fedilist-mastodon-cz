#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */
const not_dot_cz= [ //instance, které nekončí „.cz”, ale jsou české
	"ajtaci.club",
	"boskovice.social",
	"czech.social",
	"fedi.skladka.net",
];

$.api()
.command("compare-last", "Porovná dva posledni snapshoty (defaultně jen „.cz”)")
.option("--all", "Zahrnout i ne-CZ.")
.action(function({ all= false }= {}){
	const [ previous, last ]= s.$()
		.ls("./mastodon-list--*.csv")
		.slice(-2)
		.map(fileToData)
		.map(data=> all ? data : data.filter(([ domain ])=> isCz(domain)));

	const css= echo.css(
		".nadpis { color: yellow; }",
		".list_item{ margin-left: 4; }",
		".users { color: magenta; }",
		".diff { color: gray; }",
	);
	echo("%cUživatelé za instanci:", css.nadpis);
	for(const row of last){
		const [ domain, users_now ]= getDomainUsers(row);
		const [ , users_prev ]= getDomainUsers(previous.find(([ domain_prev ])=> domain_prev===domain));
		echo(`%c${domain}: %c~${users_now}%c (%crozdíl ~${users_now-users_prev}%c)`, css.list_item, css.users, css.unset, css.diff, css.unset);
	}
	
	const [ all_previous, all_last ]= [ previous, last ].map(usersCount);
	echo("%cUživatelé celkem:", css.nadpis);
	echo(`%c%c~${all_last}%c (%crozdíl ~${all_last-all_previous}%c)`, css.list_item, css.users, css.unset, css.diff, css.unset);
	$.exit(0);
})
.command("snapshot <name>", "Stáhne aktuální `csv` soubor a uloží jej `./mastodon-list--name.csv`.")
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
