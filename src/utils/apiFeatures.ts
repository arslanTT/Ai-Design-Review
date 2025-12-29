class APIFeatures {
  query;
  queryString;
  page: any;
  limit: any;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
    this.page = 1;
    this.limit = 4;
  }
  sort() {
    const validSorts = ["_id", "-_id", "likes", "-likes"];
    if (this.queryString.sort && validSorts.includes(this.queryString.sort)) {
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort("-_id");
    }

    return this;
  }
  paginate() {
    const PAGE_LIMIT = 4;
    const page = this.queryString.page || 1;
    const skip = (page - 1) * PAGE_LIMIT;
    this.query = this.query.skip(skip).limit(PAGE_LIMIT + 1);
    this.page = page;
    this.limit = PAGE_LIMIT;
    return this;
  }
  select() {
    this.query = this.query.select("-aiCritique -description  -updatedAt -__v");
    return this;
  }
  populate() {
    this.query = this.query.populate({ path: "owner", select: "username" });
    return this;
  }
}

export default APIFeatures;
