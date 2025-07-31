// ==============================================================================
//           Classe Utilitaire pour les Fonctionnalités d'API Avancées
//
// MISE À JOUR : Ajout d'une méthode `search` pour la recherche textuelle
// multi-champs.
// ==============================================================================

class APIFeatures {
  /**
   * @param {mongoose.Query} query - La requête Mongoose initiale.
   * @param {object} queryString - L'objet `req.query`.
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Gère le filtrage des résultats.
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
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  
  /**
   * Gère la recherche textuelle sur des champs prédéfinis.
   * La recherche est insensible à la casse.
   * @param {Array<string>} searchFields - Les champs sur lesquels effectuer la recherche.
   */
  search(searchFields) {
    if (this.queryString.search && searchFields && searchFields.length > 0) {
      const regex = new RegExp(this.queryString.search, 'i'); // 'i' pour insensible à la casse
      
      // Crée une condition `$or` pour chercher dans tous les champs spécifiés
      const orConditions = searchFields.map(field => ({ [field]: regex }));
      
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }


  /**
   * Gère la sélection des champs à retourner.
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Gère la pagination des résultats.
   */
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10; // Réduit la limite par défaut à 10
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;