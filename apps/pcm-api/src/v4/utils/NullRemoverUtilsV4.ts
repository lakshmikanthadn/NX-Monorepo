export class NullRemover {
  public static cleanNullField(object) {
    Object.entries(object).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        NullRemover.cleanNullField(v);
      }
      if (
        (v && typeof v === 'object' && !Object.keys(v).length) ||
        v === null
      ) {
        if (Array.isArray(object)) {
          object.splice(Number(k), 1);
        } else {
          delete object[k];
        }
      }
    });
    return object;
  }
}
