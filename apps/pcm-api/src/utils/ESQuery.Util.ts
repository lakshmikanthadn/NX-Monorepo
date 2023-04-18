import { Config } from '../config/config';

const docTypeToESIndexMapperV4 = Config.getPropertyValue(
  'docTypeToESIndexMapperV4'
);

class ESQueryUtil {
  public getESIndexByProductType(productType: string): string {
    const indexName = `${productType}Index`;
    return docTypeToESIndexMapperV4[indexName];
  }
}

export const esQueryUtil = new ESQueryUtil();
