// ==============================================================================
//           Classe Utilitaire pour les Fonctionnalités d'API Avancées
//
// Cette classe encapsule la logique de filtrage, tri, pagination, sélection de
// champs et recherche pour les requêtes Mongoose. Elle permet de garder les
// contrôleurs extrêmement propres et de standardiser les fonctionnalités
// sur toutes les routes de l'API.
//
// MISE À JOUR : Ajout d'une méthode `search` pour la recherche textuelle
// multi-champs.
// ==============================================================================

class APIFeatures {
  /**
   * @param {import("mongoose").Query} query - La requête Mongoose initiale (ex: Produit.find()).
   * @param {object} queryString - L'objet `req.query` provenant d'Express.
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Gère le filtrage des résultats basé sur les champs de la query string.
   * Ex: /api/produits?prix[lt]=50000&stock>0
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search']; // Exclure 'search'
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Gère le tri des résultats.
   * Ex: /api/produits?sort=-prix,nom
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Tri par défaut
    }
    return this;
  }
  
  /**
   * Gère la recherche textuelle sur des champs prédéfinis.
   * La recherche est insensible à la casse.
   * Ex: /api/clients?search=Dupont
   * @param {Array<string>} searchFields - Les champs sur lesquels effectuer la recherche.
   */
  search(searchFields) {
    if (this.queryString.search && searchFields && searchFields.length > 0) {
      const regex = new RegExp(this.queryString.search, 'i');
      
      const orConditions = searchFields.map(field => ({ [field]: regex }));
      
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  /**
   * Gère la sélection des champs à retourner (projection).
   * Ex: /api/produits?fields=nom,prix
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // Exclure par défaut le champ __v de Mongoose
    }
    return this;
  }

  /**
   * Gère la pagination des résultats.
   * Ex: /api/produits?page=2&limit=25
   */
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;