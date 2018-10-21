# disedt
Bot Discord affichant l'emploi du temps en R&amp;T

__Fonctionnalité principale :__
!edt <date> <TP>
Affiche l'emploi du temps d'une journée. 
L'emploi du temps est importé depuis dans un fichier ICAL, convertit en fichier JSON.
L'emploi du temps est personnalisé en fonction du rôle de la personne invoquant la commande,
  ou en fonction de l'argument TP.
L'emploi du temps affiche les cours de la journée actuelle, 
  ou ceux du prochain jour de cours si le dernier cours de la journée est passé.
  Si la date invoquée est vide de cours, affiche la prochaine journée de cours.
Ou la date donnée en argument : accepte les formats jj/mm et j/m (convertis en jj/mm par le script)
(Une date avec un mois inférieur à 8 est passé à 2019, les autres sont en 2018).

L'ordre des arguments n'importe pas, un argument faux est ignoré.

Adapte les horaires en fonction des changements d'heure (hiver/été).



__Fonctionnalités secondaires :__
*tout message commençant par un ! est considéré comme une commande,
le message est donc automatiquement supprimé à la fin de son traitement par le bot*

!ping
le bot répond `pong` 

__Fonctionnalités prévues :__
!LMGTFY créant un lien http://lmgtfy.com/ avec le message précédant.

!update actualise l'emploi du temps en téléchargeant le fichier ical sur l'ENT.