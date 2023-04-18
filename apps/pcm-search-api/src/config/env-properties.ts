/**
 * Add all the common properties here.
 * You still can override these properties at each ENV properties config.
 */

export const commonConfigProperties = {
  defaultAwsRegion: 'us-east-1',
  defaultBatchSizeV4: 30,
  expandedAPIDefaultBatchSize: 10,
  expandedAPIMaxBatchSize: 100,
  logPath: '/logs/pcm-search-api',
  maxBatchSizeV4: 50,
  partsAPIMaxBatchSizeV4: 500,
  requestBodySizeLimit: 1 * 1024 * 1024,
  searchAPIMaxBatchSizeV4: 1000
};

/**
 * Configuration for: DEV
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
const devConfigProperties = {
  ESUrl:
    'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',

  authUrl: 'https://api-dev.taylorfrancis.com/v2/auth',
  bookIndex: 'books-dev-searching-alias',
  chapterIndex: 'chapters-dev-searching-alias',
  collectionIndex: 'collections-dev-searching-alias',
  creativeWorkIndex: 'creativework-dev-searching-alias',
  'entry-versionIndex': 'entryversion-dev-searching-alias',
  entryIndex: 'entry-dev-searching-alias',
  entryVersionIndex: 'entryversion-dev-searching-alias',
  envName: 'dev',
  preChapterIndex: 'prechapters-dev-searching-alias',
  scholarlyArticleIndex: 'articles-dev-searching-alias'
};

/**
 * Configuration for: UAT
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
const uatConfigProperties = {
  ESUrl:
    'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
  authUrl: 'https://api-uat.taylorfrancis.com/v2/auth',
  bookIndex: 'books-uat-searching-alias',
  chapterIndex: 'chapters-uat-searching-alias',
  collectionIndex: 'collections-uat-searching-alias',
  creativeWorkIndex: 'creativework-uat-searching-alias',
  'entry-versionIndex': 'entryversion-uat-searching-alias',
  entryIndex: 'entry-uat-searching-alias',
  entryVersionIndex: 'entryversion-uat-searching-alias',
  envName: 'uat',
  preChapterIndex: 'prechapters-uat-searching-alias',
  scholarlyArticleIndex: 'articles-uat-searching-alias'
};

/**
 * Configuration for: PROD
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
const prodConfigProperties = {
  ESUrl:
    'https://vpc-es-use1-df-pcm-search-p-ywzvufapmozat74ofnxn5y4hni.us-east-1.es.amazonaws.com',
  authUrl: 'https://api.taylorfrancis.com/v2/auth',
  bookIndex: 'books-prod-searching-alias',
  chapterIndex: 'chapters-prod-searching-alias',
  collectionIndex: 'collections-prod-searching-alias',
  creativeWorkIndex: 'creativework-prod-searching-alias',
  'entry-versionIndex': 'entryversion-prod-searching-alias',
  entryIndex: 'entry-prod-searching-alias',
  entryVersionIndex: 'entryversion-prod-searching-alias',
  envName: 'prod',
  preChapterIndex: 'prechapters-prod-searching-alias',
  scholarlyArticleIndex: 'articles-prod-searching-alias'
};

/**
 * Configuration for: LOCAL
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
const localConfigProperties = {
  ESUrl:
    'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
  authUrl: 'https://api-dev.taylorfrancis.com/v2/auth',
  bookIndex: 'books-dev-searching-alias',
  chapterIndex: 'chapters-dev-searching-alias',
  collectionIndex: 'collections-dev-searching-alias',
  creativeWorkIndex: 'creativework-dev-searching-alias',
  'entry-versionIndex': 'entryversion-dev-searching-alias',
  entryIndex: 'entry-dev-searching-alias',
  entryVersionIndex: 'entryversion-dev-searching-alias',
  envName: 'local',
  preChapterIndex: 'prechapters-dev-searching-alias',
  scholarlyArticleIndex: 'articles-dev-searching-alias'
};

/**
 * Configuration for: QA
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
const qaConfigProperties = {
  ESUrl:
    'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
  authUrl: 'https://api-uat.taylorfrancis.com/v2/auth',
  bookIndex: 'books-qa-searching-alias',
  chapterIndex: 'chapters-qa-searching-alias',
  collectionIndex: 'collections-qa-searching-alias',
  creativeWorkIndex: 'creativework-qa-searching-alias',
  'entry-versionIndex': 'entryversion-qa-searching-alias',
  entryIndex: 'entry-qa-searching-alias',
  entryVersionIndex: 'entryversion-qa-searching-alias',
  envName: 'qa',
  preChapterIndex: 'prechapters-qa-searching-alias',
  scholarlyArticleIndex: 'articles-qa-searching-alias'
};

/**
 * Configuration for: TEST
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
const testConfigProperties = {
  // TODO check why its fail with random url
  ESUrl:
    'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
  authUrl: '',
  bookIndex: 'books-dev-searching-alias',
  chapterIndex: 'chapters-dev-searching-alias',
  collectionIndex: 'collections-dev-searching-alias',
  creativeWorkIndex: 'creativework-dev-searching-alias',
  'entry-versionIndex': 'entryversion-dev-searching-alias',
  entryIndex: 'entry-dev-searching-alias',
  entryVersionIndex: 'entryversion-dev-searching-alias',
  envName: 'test',
  preChapterIndex: 'prechapters-dev-searching-alias',
  scholarlyArticleIndex: 'articles-dev-searching-alias'
};

export const configProperties = {
  DEV: devConfigProperties,
  LOCAL: localConfigProperties,
  PRODUCTION: prodConfigProperties,
  QA: qaConfigProperties,
  TEST: testConfigProperties,
  UAT: uatConfigProperties
};
