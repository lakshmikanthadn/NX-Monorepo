import { OpenApiComponentV4 as OpenApiComponent } from '@tandfgroup/pcm-entity-model-v4';
import * as fs from 'fs';
import * as _ from 'lodash';

const openApiComponent: any = OpenApiComponent;
const productTypes = [
  'book',
  'chapter',
  'collection',
  'creativeWork',
  'scholarlyArticle',
  'set',
  'series',
  'journal',
  'publishingService',
  'preChapter',
  'entry',
  'entryVersion'
];

// adding appropriate identifiers specific to the product
const validIdentifiers = {
  book: [
    'dacKey',
    'doi',
    'editionId',
    'isbn',
    'orderNumber',
    'titleId'
    // 'sku',
  ],
  chapter: [
    'chapterId',
    'doi'
    // 'sku',
  ],
  creativeWork: ['doi'],
  scholarlyArticle: [
    'articleId',
    'articleSectionId',
    'doi',
    'elocationId'
    // 'sku',
  ],
  // adds for set needs to confirm?
  set: [
    'dacKey',
    'doi',
    'editionId',
    'isbn',
    'orderNumber',
    'titleId'
    // 'sku',
  ]
};
// generating the schema with valid-identifiers
// for book, chapter, scholarlyArticle, creativeWork & set for the time being
type productType =
  | 'book'
  | 'chapter'
  | 'scholarlyArticle'
  | 'creativeWork'
  | 'set';
export const actualProducts = ['StoreProduct'];
const storeProduct = 'StoreProduct';
const allSchemaModel: any = {};

// STEP 1. Prepare the schema mapper for the generic Store Product.
const propertiesOfStoreProduct =
  openApiComponent.definitions[storeProduct].properties;
const jsDataTypeOfStoreProduct =
  openApiComponent.definitions[storeProduct].type;
for (const property in propertiesOfStoreProduct) {
  if (
    Object.prototype.hasOwnProperty.call(propertiesOfStoreProduct, property)
  ) {
    propertiesOfStoreProduct[property] = findTheModel(
      property,
      propertiesOfStoreProduct
    );
  }
}
propertiesOfStoreProduct['_jsDataType'] = jsDataTypeOfStoreProduct;

// STEP 2. Prepare the schema mapper for each PRODUCT type
// from the schema mapper of generic Store Product.
productTypes.map((type) => {
  const productSchema = _.cloneDeep(propertiesOfStoreProduct); // { ...propertiesOfProduct };
  // generating schema for different products
  productTypes.map((pType) => {
    if (type !== pType) {
      delete productSchema[pType];
    }
  });
  allSchemaModel[type] = generateProductSchema(
    productSchema,
    type as productType
  );
});
// STEP 3. Write the schema mapper to a file.
fs.writeFileSync(
  'lib/model/definitions/schemaMapper.json',
  JSON.stringify(allSchemaModel)
);

function generateProductSchema(productSchema: any, type: productType) {
  if (Object.prototype.hasOwnProperty.call(validIdentifiers, type)) {
    const keys = Object.keys(productSchema.identifiers);
    const diff = keys.filter((x) => !validIdentifiers[type].includes(x));
    diff.map((k) => {
      delete productSchema.identifiers[k];
    });
  }
  return productSchema;
}
function findTheModel(modelAttribute: string, fromModel: any) {
  let finalDataType = fromModel[modelAttribute];
  const items = fromModel[modelAttribute]['items'];
  const ref = fromModel[modelAttribute]['$ref'];
  let jsArrayDataType;
  const attributeType = fromModel[modelAttribute]['type'];
  if (items !== undefined && items['$ref'] !== undefined) {
    // getting the parent type especially to fetch array.
    jsArrayDataType = fromModel[modelAttribute]['type'];
  }
  if (
    (items !== undefined && items['$ref'] !== undefined) ||
    ref !== undefined
  ) {
    let reference = ref || items['$ref'];
    reference = reference.replace('OpenApiSchema#/definitions/', '');
    finalDataType = openApiComponent.definitions[reference].properties;
    const jsObjectDataType = openApiComponent.definitions[reference].type;
    if (finalDataType !== undefined) {
      for (const newKey in finalDataType) {
        if (Object.prototype.hasOwnProperty.call(finalDataType, newKey)) {
          finalDataType[newKey] = findTheModel(newKey, finalDataType);
        }
      }
    } else {
      // for mediaType as it doesn't has properties key as it is enum
      finalDataType = openApiComponent.definitions[reference];
    }
    finalDataType['_jsDataType'] = jsArrayDataType
      ? jsArrayDataType
      : jsObjectDataType;
  } else if (
    !Object.keys(finalDataType).includes('_jsDataType') &&
    modelAttribute !== '_jsDataType'
  ) {
    // removing type and replacing it with _jsDataType
    finalDataType['_jsDataType'] = attributeType;
    delete finalDataType.type;
  }
  // for handling items which have type inside instead of $ref e.g contributors.roles
  if (items !== undefined && items['type'] !== undefined) {
    finalDataType['_jsDataType'] = fromModel[modelAttribute]['items'].type;
    // We do not need to update these values as string[]
    // as mongo works the same way for both sring[] and string
    // updating _jsDataType as string[] e.g. availability.status, contributors.roles
    // finalDataType['_jsDataType'] = fromModel[modelAttribute]._jsDataType === 'array' ?
    //     fromModel[modelAttribute]['items'].type + '[]' :
    //     fromModel[modelAttribute]['items'].type;
    delete finalDataType.items;
  }
  return finalDataType;
}
