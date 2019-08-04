class APIFeatures {
  constructor(dbQuery, query) {
    this.dbQuery = dbQuery;
    this.query = query;
  }

  filter() {
    // Filtering
    let query = { ...this.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach(field => delete query[field]);

    // Advanced Filtering
    let queryString = JSON.stringify(query);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      match => `$${match}`
    );

    query = JSON.parse(queryString);

    this.dbQuery = this.dbQuery.find(query);

    return this;
  }

  sort() {
    // Sorting
    if (this.query.sort) {
      const sortBy = this.query.sort.split(',').join(' ');
      this.dbQuery = this.dbQuery.sort(sortBy);
    } else {
      this.dbQuery = this.dbQuery.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // Fields Limiting
    if (this.query.fields) {
      const fields = this.query.fields.split(',').join(' ');
      this.dbQuery = this.dbQuery.select(fields);
    } else {
      this.dbQuery = this.dbQuery.select('-__v');
    }

    return this;
  }

  paginate() {
    // Pagination
    const page = parseInt(this.query.page, 10) || 1;
    const limit = parseInt(this.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    this.dbQuery = this.dbQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
