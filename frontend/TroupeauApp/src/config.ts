// URL du serveur backend.
// En développement local : http://localhost:8000
// En production (Render) : changer cette valeur, ou définir la variable
// d'environnement API_URL avant de lancer l'application.
export const API_BASE_URL: string =
  (typeof process !== 'undefined' && process.env['API_URL']) ||
  'http://localhost:8080';
