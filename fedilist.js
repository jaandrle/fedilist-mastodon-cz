#!/usr/bin/env nodejsscript
/* jshint esversion: 11,-W097, -W040, module: true, node: true, expr: true, undef: true *//* global echo, $, pipe, s, fetch, cyclicLoop */

$.api()
.command("compare-last", "Porovná dva posledni snapshoty (defaultně jen „.cz”)")
.option("--all", "Zahrnout i ne-CZ.")
.action(function({ all= false }= {}){
	const [ yesterday, today ]= s.$()
		.ls("./mastodon-list--*.csv")
		.slice(-2)
		.map(fileToData)
		.map(data=> all ? data : data.filter(([ domain ])=> isCz(domain)))
		.map(usersCount);
	echo({ today, yesterday });
	echo({ diff: today-yesterday });
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
function isCz(candidate){ return /\.cz$/.test(candidate) || candidate==="czech.social" || candidate==="boskovice.social"; }
