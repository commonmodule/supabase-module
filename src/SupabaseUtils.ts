class SupabaseUtils {
  private convertNullToUndefined(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === null) obj[key] = undefined;
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        this.convertNullToUndefined(obj[key]);
      }
    });
  }

  public safeResult<T>(data: T): T {
    if (Array.isArray(data)) {
      data.forEach((obj) => this.convertNullToUndefined(obj));
    } else this.convertNullToUndefined(data);
    return data;
  }
}

export default new SupabaseUtils();
