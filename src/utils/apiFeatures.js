/**
 * API Features Utility Class
 * Handles filtering, search, sorting, pagination
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // mongoose query
    this.queryString = queryString; // req.query
  }

  // --------------------------------------------------
  // 🔍 FILTERING
  // --------------------------------------------------
  filter() {
    const queryObj = { ...this.queryString };

    // Fields to exclude
    const excludedFields = ["page", "limit", "sort", "search", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, lte, etc.)
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Remove soft-deleted by default
    parsedQuery.isDeleted = false;

    this.query = this.query.find(parsedQuery);

    return this;
  }

  // --------------------------------------------------
  // 🔎 SEARCH (text-based)
  // --------------------------------------------------
  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const searchRegex = new RegExp(this.queryString.search, "i");

      const searchConditions = fields.map((field) => ({
        [field]: searchRegex,
      }));

      this.query = this.query.find({
        $or: searchConditions,
      });
    }

    return this;
  }

  // --------------------------------------------------
  // 🔃 SORTING
  // --------------------------------------------------
  sort() {
    if (this.queryString.sort) {
      // multiple fields: sort=amount,-date
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // default
    }

    return this;
  }

  // --------------------------------------------------
  // 📄 FIELD LIMITING
  // --------------------------------------------------
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    return this;
  }

  // --------------------------------------------------
  // 📊 PAGINATION
  // --------------------------------------------------
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
