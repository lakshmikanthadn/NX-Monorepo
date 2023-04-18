export function buildESNestedQuery(path: string, query: any) {
  if (path === '') {
    return query;
  } else {
    return {
      nested: {
        path,
        query
      }
    };
  }
}
