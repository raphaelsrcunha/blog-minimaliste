
# Blog Minimaliste - API

## Description
L'API Blog Minimaliste permet la gestion d'un blog avec des fonctionnalités telles que l'inscription et la connexion des utilisateurs, la gestion des posts et des commentaires. Elle utilise MySQL comme base de données et JSON Web Tokens (JWT) pour l'authentification des utilisateurs.

## Prérequis
Avant de démarrer l'application, assurez-vous d'avoir installé les dépendances suivantes:

- Node.js
- MySQL
- npm (ou yarn)

## Installation

1. Clonez ce dépôt:
   ```bash
   git clone https://github.com/raphaelsrcunha/blog-minimaliste.git
   cd blog-minimaliste
   ```

2. Installez les dépendances:
   ```bash
   npm install
   ```

3. Créez un fichier `.env` dans la racine du projet et ajoutez votre configuration de base de données:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=blog
   ```

4. Démarrez l'application:
   ```bash
   npm start
   ```

   Ou en mode développement:
   ```bash
   npm run dev
   ```

L'API sera accessible à `http://localhost:3000`.

## Fonctionnalités

### Authentification

- **POST /register**: Crée un nouvel utilisateur. Les informations requises sont le `username`, le `password`, et le `role`.
- **POST /login**: Permet à un utilisateur de se connecter avec son `username` et `password` pour obtenir un token JWT.

### Utilisateurs

- **GET /user**: Récupère les informations de l'utilisateur connecté.
- **GET /users**: Récupère la liste de tous les utilisateurs (réservée aux administrateurs).
- **PUT /user/:id**: Permet à un utilisateur de modifier ses informations (ou à un administrateur de modifier celles des autres utilisateurs).
- **DELETE /user**: Supprime l'utilisateur connecté.

### Posts

- **POST /posts**: Crée un nouveau post.
- **GET /posts**: Récupère la liste de tous les posts.
- **GET /posts/:id**: Récupère un post spécifique par son `id`.
- **PUT /posts/:id**: Met à jour le contenu d'un post spécifique.
- **DELETE /posts/:id**: Supprime un post spécifique.

### Commentaires

- **POST /posts/:postId/comments**: Ajoute un commentaire à un post.
- **GET /comments**: Récupère tous les commentaires (si l'utilisateur est admin) ou les commentaires de l'utilisateur connecté.
- **PUT /comments/:commentId**: Met à jour un commentaire spécifique.
- **DELETE /comments/:commentId**: Supprime un commentaire spécifique.

## Structure du projet

```
blog-minimaliste/
├── app.js          # Point d'entrée du serveur Express
├── db.js           # Connexion à la base de données MySQL
├── routes/         # Contient les routes de l'API
│   └── index.js    # Routes principales de l'application
├── package.json    # Dépendances et scripts du projet
├── .env            # Variables d'environnement (pour la base de données)
└── README.md       # Documentation du projet
```

## Technologies utilisées

- **Node.js** avec **Express** pour le serveur.
- **MySQL** comme base de données.
- **JWT** (JSON Web Tokens) pour l'authentification.
- **bcrypt** pour le hachage des mots de passe.
- **dotenv** pour gérer les variables d'environnement.
- **Nodemon** pour le rechargement automatique en développement.

## Développement

1. Clonez ce projet et installez les dépendances.
2. Pour démarrer l'application en développement, utilisez `npm run dev`.
3. Pour tester l'application, vous pouvez utiliser Postman ou cURL pour tester les différents endpoints.

## Licence

Ce projet est sous licence ISC.

