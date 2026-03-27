// URL du serveur backend.
// En production (Render) : https://projet-mouton.onrender.com
// Pour le développement local, définir la variable d'environnement API_URL=http://localhost:8080
export const API_BASE_URL: string =
  (typeof process !== 'undefined' && process.env['API_URL']) ||
  'https://projet-mouton.onrender.com';
