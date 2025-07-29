// ==============================================================================
//           Classe Utilitaire pour les Fonctionnalités d'API Avancées
//
// Cette classe encapsule la logique pour appliquer le filtrage, le tri, la
// limitation de champs et la pagination aux requêtes Mongoose.
//
// Elle permet de transformer un simple `Model.find()` en un endpoint d'API
// puissant et flexible, simplement en parsant l'objet `req.query`.
//
// Usage :
//   const features = new APIFeatures(Model.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const results = await features.query;
// ==============================================================================

class APIFeatures {
  /**
   * @param {mongoose.Query} query - La requête Mongoose initiale (ex: Produit.find()).
   * @param {object} queryString - L'objet `req.query` provenant d'Express.
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Gère le filtrage des résultats.
   * - Filtre de base : `?isActive=true`
   * - Filtre avancé : `?solde[gte]=10000` (solde "greater than or equal")
   */
  filter() {
    // 1. Créer une copie de la query string
    const queryObj = { ...this.queryString };

    // 2. Exclure les champs spéciaux utilisés par les autres méthodes
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 3. Gérer les opérateurs avancés (gte, gt, lte, lt)
    // On transforme { "solde": { "gte": "10000" } } en { "solde": { "$gte": "10000" } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // 4. Appliquer le filtre à la requête Mongoose
    this.query = this.query.find(JSON.parse(queryStr));

    return this; // Permet de chaîner les méthodes
  }

  /**
   * Gère le tri des résultats.
   * - Tri simple : `?sort=nom` (ascendant)
   * - Tri descendant : `?sort=-nom`
   * - Tri multiple : `?sort=-solde,nom` (par solde descendant, puis par nom ascendant)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Tri par défaut : les plus récents d'abord
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Gère la sélection des champs à retourner (projection).
   * - Sélection de champs : `?fields=nom,email,solde`
   * - Exclusion de champs : `?fields=-description,-__v`
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Par défaut, on exclut le champ `__v` de Mongoose
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Gère la pagination des résultats.
   * - `?page=2&limit=10`
   */
  paginate() {
    const page = this.queryString.page * 1 || 1; // Convertit en nombre, défaut page 1
    const limit = this.queryString.limit * 1 || 100; // Défaut 100 résultats par page
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;