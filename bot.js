const Discord = require('discord.js');
const client = new Discord.Client();
const ical2json = require("ical2json");
const fs = require('fs');
const wget = require('node-wget');
const sleep = require('sleep');
wget({
		        url:  process.env.URL,
		        dest: './ADECal.ics',      // destination path or path with filenname, default is ./
		        timeout: 2000       // duration to wait for request fulfillment in milliseconds, default is 2 seconds
		    });
sleep.sleep(2);
var file = fs.readFileSync('./ADECal.ics');
var cal = ical2json.convert(file);
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
//====================================Fonctions=========================//
function today() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //Janvier c'est 0 !
	var yyyy = today.getFullYear();
	if(dd<10) {
	    dd = '0'+dd;
	} 
	if(mm<10) {
	    mm = '0'+mm;
	}
	sortie = ""+yyyy + mm + dd;
	return sortie;
};
//-----------------------------//
function datify(entry) {
	if (entry.length < 2) {
		entry='0'+entry;
	} 
	return entry;
}
//-----------------------------//
function totime() {
	var time = new Date();
	var decalage=1;
	if (parseInt(String(time.getMonth()+1)+String(time.getDate())) < 1031 && parseInt(String(time.getMonth()+1)+String(time.getDate())) > 330) {
		decalage=2;
	}
	var sortie = ""+datify(String(time.getHours()+decalage))+datify(String(time.getMinutes()));
	return sortie;
};
//-----------------------------//

function getEvents(date,TP) { //Renvoie une liste des évenements
	console.log("\n=================[EVENTS]==================")
	console.log("[EVENTS] Searching events for",date);
	file = fs.readFileSync('./ADECal.ics');
	cal = ical2json.convert(file);
	var data=cal.VCALENDAR[0].VEVENT; //charge le calendrier
	var time=[];
	var sortie=[];
	var liste=[];
	if (TP.match(/TP[12]/i)) { //Trouve le TD correspondant
		var TD = "TDA";
	}
	else if (TP.match(/TP[34]/i)) {
		var TD = "TDB";
	}
	for (var i in data){ //cherche les événements correspondants à la date et au TD/TP
		if (data[i].DTSTART.startsWith(date)){
			console.log("[EVENTS] Cours trouve, verification TP...")
			var long=data[i].SUMMARY.length;
			if (data[i].SUMMARY.includes(TP) || data[i].SUMMARY.includes(TD) || data[i].SUMMARY.slice(long-1)=='s' || (data[i].SUMMARY.includes("Examen")&& !(data[i].SUMMARY.includes("TP") || data[i].SUMMARY.includes("TD")))) {
				console.log("[EVENTS] TP Correspondant !");
				time.push(data[i].DTSTART.slice(data[i].DTSTART.length-7,data[i].DTSTART.length-3));
				liste.push(data[i]);
			}
		}
	}
	console.log("===================Fini");
	var oldtime=[];  //stocke une copie de la liste des horaires
	for (var i in time) { // pour pouvoir retrouver l'ordre original
		oldtime.push(time[i]);
	}
	time.sort(); // Trie la liste des horaires
	console.log("[EVENTS] evenements : ");
	for (var i in time) { // Renvoie les événements dans sortie
		sortie.push(liste[oldtime.indexOf(time[i])]); // dans l'ordre des horaires triés
		console.log(["EVENTS]",liste[oldtime.indexOf(time[i])].SUMMARY);
	}
	console.log("===========================================\n");
	return sortie;
}


//====================================Commandes du bot=========================//
client.on('message', function(msg){
	if (!msg.guild) return;
	if (msg.content.startsWith('!')) { // Détecte une requête du bot (!)
		var reponse=[];
		var command = msg.content.slice(1).split(" "); //Découpe la commande en mots séparés par des " "
		var args = command.slice(1); //Stocke les arguments
		command = command[0]; // Stocke la commande seule
		console.log("\n[COMMAND] ",msg.author.username,":", command, "with args :", args);


		//-----------------------------//
		if (command=='ping') {
			msg.reply("`pong`");
			console.log(today());
		}
		//-----------------------------//
		if (command=='update') {
			fs.unlinkSync('./ADECal.ics');
			sleep.sleep(1);
			wget({
		        url:  process.env.URL,
		        dest: './ADECal.ics',      // destination path or path with filenname, default is ./
		        timeout: 2000       // duration to wait for request fulfillment in milliseconds, default is 2 seconds
		    });
		    sleep.sleep(2);
			file = fs.readFileSync('./ADECal.ics');
			cal = ical2json.convert(file);
		    console.log(cal);
		    console.log('\n ================MAJ EDT====================\n');
		    reponse.push("**EDT mis à jour !**");
		}
		if (command=='facebook'||command=='fb') {
			reponse.push(process.env.FBLINK);
		}
		if (command=='pulls'||command=='pull'||command=='sweats') {
			reponse.push("C'est trop tard !");
		}
		//-----------------------------//
		if (command=='edt') {// Assigne initialement la variable TP en fction du role
			var actual = totime();
			var decalage=2;
			var date=today();
			var dateY=date.slice(0,4);
			var dateM=date.slice(4,6);
			var dateD=date.slice(6);
			var TP = "TP2";
			if (msg.member.roles.has(msg.guild.roles.find("name", "TP1").id)) {//Définit la variable TP en fonction du role trouvé
				TP = "TP1";
			}
			else if (msg.member.roles.has(msg.guild.roles.find("name", "TP2").id)) {
				TP = "TP2";
			}
			else if (msg.member.roles.has(msg.guild.roles.find("name", "TP4").id)) {
				TP = "TP3";
			}
			else if (msg.member.roles.has(msg.guild.roles.find("name", "TP4").id)) {
				TP = "TP4";
			}
			if (args.length>0) { //Si des arguments ont été donnés à la variable
				for (i in args) { //Trouve un potentiel argument "tp." avec . le n° du TP
					if (args[i].match(/^TP[1-4]/i)) {
						TP = "TP"+args[i][2];
					}
					if (args[i].match(/^([0]?[0-9]|[12][0-9]|[3][01])\/[0]?[1-9]|[1][012]/)) {
						console.log("[DATE] MATCH");// a detecté un argument au format jj/mm
						if (parseInt(args[i].slice(args[i].indexOf("\/")+1)) < 13) {
							console.log("[DATE] vrai mois !");
							dateD = args[i].slice(0,args[i].indexOf("\/"));//Stocke le jour (avant le /)
							dateM = args[i].slice(args[i].indexOf("\/")+1);//Stocke le mois (après le /)
						}
					}
				}
			}
			if (dateM<9) {  //Ajoute l'année correspondante à la date.
				dateY="2019";
			}
			dateM=datify(dateM);
			dateD = datify(dateD);
			date=dateY+dateM+dateD;
			if (parseInt(date)>20181027) { //Mise en forme des dates + heure d'hiver
				decalage=1;
			}
			if (parseInt(date)>20190330) {
				decalage=2;
			}
			console.log("[DATE] year:",dateY," month:",dateM,"day:",dateD); //Recherche des events à cette date :
			var events = getEvents(date,TP);
			console.log("[EDT]",events.length,"événements trouvés");
			console.log("[EDT] Dernier cours :",events.slice(-1).SUMMARY);
			if ((events.length<1)||(parseInt(events[events.length-1].DTEND.slice(9,13)) < (parseInt(actual)-decalage)&&date==today())) {
				if (events.length>0) {
					console.log("[EDT]",date,"Journée terminée");
					events=[];
				}// Vide les événements lorsque le dernier cours de la journée est terminé.
				console.log("[EDT] Journée vide ou terminée");
				var j = 0;
				while (events.length<1) { // Parcours les jours suivants cherchant des cours
					if (j>0) {
						console.log("[EDT] ",date," : toujours rien");
					}
					if (j>20) {
						console.log("[EDT] Pas de cours sur 20 jours : FIN");
						reponse="Ya un pb...";
						break;
					}
					j++;
					dateD = parseInt(dateD);
					dateM = parseInt(dateM);
					dateY = parseInt(dateY);
					if (dateD > 30) { //Les mois n'ont que 31 jours max
						dateD = 1;
						if (dateM>11) {// Que 12 mois dans l'année
							dateM=1;
							dateY++;
						}
						else {
							dateM++;
						}
					}
					else {
						dateD++;
					}
					dateD = String(dateD); //Mise en forme de la date
					dateM = String(dateM);
					dateY = String(dateY);
					dateM=datify(dateM);
					dateD=datify(dateD);
					date=dateY+dateM+dateD;
					if (parseInt(date)>20181027) { //Heure d'hiver 
						decalage=1;
					}
					if (parseInt(date)>20190330) {
						decalage=2;
					}
					events=getEvents(date,TP);
				}
			}
			reponse.push("**EDT du "+TP+" pour le "+dateD+"/"+dateM+" :**");
			var eDesc;
			for (var i in events) { // Liste les cours dans la variable reponse
				eDesc=events[i].DESCRIPTION;
				reponse.push(events[i].SUMMARY+" à __"+String(parseInt(events[i].DTSTART.slice(9,11))+decalage)+"h"+events[i].DTSTART.slice(11,13)+"__ à *"+events[i].LOCATION+"* avec "+eDesc.slice(eDesc.slice(0,eDesc.indexOf('(')-5).lastIndexOf('\\')+2,events[i].DESCRIPTION.indexOf("(")-2));		
			}
		}
		if (reponse.length>0) {
			msg.reply(reponse);
		}
		msg.delete();
	}
});
client.login(process.env.HTKEN);