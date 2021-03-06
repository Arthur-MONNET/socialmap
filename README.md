# Socialmap  

SocialMap est un projet crée avec l'API Twitter.

Il a pour objectif la visualisation des tweets et de leur retweets sur une carte dans le cadre d'une campagne ou d'une veille concurencielle

![Carte](https://github.com/Arthur-MONNET/socialmap/blob/main/public/asset/img/img2_hom2.png?raw=true)

## Prérequis

Le projet utilise node version 16.13.1, ainsi que dotenv pour le serveur et les variable environnementales.

Pour ce connecter avec l'API Twitter, nous utilisons la librairie ['twitter-api-v2'](https://github.com/plhery/node-twitter-api-v2).
Elle permet de faire des requêtes a l'API twitter facilement et sans dépendences.

Au niveau des acces à l'API Twitter, vous avez besion de votre propre acces en creant votre propre app sur l'[espace developper](https://developer.twitter.com/en/portal/dashboard)

Le projet utilise également Mapbox pour l'affichage et les fonctionnalité de la carte. Donc il vous faudra votre propre token pour la map. [Mapbox](https://docs.mapbox.com/) est un outil gratuit.

## Installation 

Apres avoir clonné ce repository, il suffit de faire:
```
npm install
```
Puis de créer un fichier .env avec un 'MAP_TOKEN' qui correspond a votre token mapbox et un 'BEARER_TOKEN' qui corresond avec votre Bearer token de votre app Twitter

Le serveur se lance ensuite avec :
```
nmp start
```

Pour lancer le coté client, il suffit de mettre cette url dans votre navigateur:
```
localhost:3001
```

## Flux de donnée et architecture du site

Les données sont recolté de l'API Twitter puis mise en forme par le code pour être afficher sur le site

Le site à un serveur pour la recolte de données à partir de twitter et un coté client qui affiche ces données une fois formatées

Schemas sur [ce lien](https://docs.google.com/document/d/18rZ9HmRcqnnSFz9ONpNfxxLU8Qc-KgeC9FKbzI1sRBk/edit?usp=sharing)


## Demo 

Vous trouverez une demo de ce projet vers sur [ce lien](https://socialmapxtwitter.herokuapp.com)
