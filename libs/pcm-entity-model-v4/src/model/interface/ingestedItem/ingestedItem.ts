interface IFiles {
  s3Url: string;
  size: Number;
  type: string;
  chapterId: string;
}

interface IEntries {
  code: string;
  passed: boolean;
  messages: [string];
}

interface IValidationResults {
  id: string;
  createdDate: Date;
  type: string;
  entries: [IEntries];
}

interface IIdentifiers {
  isbn: string;
  titleId: String;
  webPdfIsbn: String;
  doi: string;
  dac: String;
  epubIsbn: string;
  mobiIsbn: string;
  eanCode: string;
  editionId: string;
}

interface IIngestTrigger {
  rqDate: string;
  rqUID: string;
  source: string;
  businessProcess: string;
  s3Reference: string;
  fileName: string;
  sourceFileName: string;
  size: string;
  journalAcronym: string;
  articleId: string;
  volume: string;
  issue: string;
  assetState: string;
  vendor: string;
  applicationName: string;
  fileEncoding: string;
  mimeType: string;
  assetType: string;
  eTag: string;
  object: string;
  versionType: string;
  typeSetterS3Bucket: string;
}

interface ICopyright {
  holder: string;
  statement: string;
  year: Number;
}

interface IKeywords {
  type: string;
  value: string;
}

interface IContributers {
  givenNames: string;
  surname: string;
  type: string;
}

interface IRefrence {
  articleTitle: string;
  chapterTitle: string;
  conferenceName: string;
  contributors: [IContributers];
  edition: string;
  firstPage: string;
  id: string;
  issue: string;
  lastPage: string;
  publicationDate: string;
  publicationType: string;
  publisherLocation: string;
  publisherName: string;
  source: string;
  volume: string;
}

interface IChapters {
  abstractText: string;
  doi: string;
  firstPage: string;
  id: string;
  keywords: [IKeywords];
  label: string;
  lastPage: string;
  references: [IRefrence];
  relatedObjects: string;
  subtitle: string;
  title: string;
  type: string;
}

interface IMetadataBody {
  chapters: [IChapters];
  sectionType: string;
}

interface IClassificationEntries {
  description: string;
  level: string;
}

interface IClassifications {
  entries: [IClassificationEntries];
  type: string;
}

interface ICopyright {
  holder: string;
  statement: string;
  year: Number;
}

interface IDistributionCenters {
  discountGroup: string;
  discountGroupCode: string;
  distributionCenter: string;
  distributionCenterCode: string;
  plannedPublicationDate: string;
  primaryDistributionCenter: string;
  publicationDate: string;
  status: string;
  statusCode: string;
}

interface IExclusionList {
  iso2: string;
  iso3: string;
  isonum: string;
  name: string;
}

interface IDistributionRights {
  exclusionList: [IExclusionList];
}

interface IFront {
  chapters: [IChapters];
  sectionType: string;
}

interface IMarketingRestrictions {
  noCanada: boolean;
  noLatAm: boolean;
  noROW: boolean;
  noUS: boolean;
}

interface INetbaseClassifications {
  code: string;
  description: string;
}

interface IOriginators {
  firstName: string;
  lastName: string;
  originatorType: string;
  originatorTypeCode: string;
  sortOrder: string;
}

interface IPricing {
  currency: string;
  price: string;
  priceType: string;
  priceTypeCode: string;
  validFrom: string;
}

interface ISubjectClassification {
  code: string;
  description: string;
  level: string;
  priority: string;
}

interface IMetadata {
  abstractText?: string;
  bindingStyle?: string;
  bindingStyleCode?: string;
  body?: IMetadataBody;
  classifications?: [IClassifications];
  contributors?: [IContributers];
  copyright?: ICopyright;
  copyrightYear?: string;
  dac?: string;
  distributionCenters?: [IDistributionCenters];
  distributionRights?: IDistributionRights;
  division?: string;
  divisionCode?: string;
  doi?: string;
  drm?: string;
  ebookRestriction?: string;
  ebookRestrictionCode?: string;
  edition?: string;
  firstPublishedYear?: string;
  format?: string;
  front?: IFront;
  groupOfCompany?: string;
  identifiers?: IIdentifiers;
  infoRestrict?: string;
  infoRestrictType?: string;
  isbn?: string;
  isBookSet?: { type?: Boolean };
  keywords?: [IKeywords];
  marketingRestrictions?: IMarketingRestrictions;
  netbaseClassifications?: [INetbaseClassifications];
  notSoldSeparately?: { type?: Boolean };
  openAccess?: { type?: Boolean };
  orderNo?: string;
  originators?: [IOriginators];
  pageCount?: { type?: Number };
  plannedPublicationDate?: string;
  podSuitable?: { type?: Boolean };
  pricing?: [IPricing];
  publicationDate?: string;
  publisherArea?: string;
  publisherAreaCode?: string;
  publisherImprint?: string;
  publisherName?: string;
  readyForMarket?: { type?: Boolean };
  refrences?: [IRefrence];
  shortBlurb?: string;
  status?: string;
  statusCode?: string;
  subjectClassifications?: [ISubjectClassification];
  subtitle?: string;
  textType?: string;
  textTypeCode?: string;
  title?: string;
  version?: string;
  versionType?: string;
  versionTypeCode?: string;
}

interface ICounts {
  numberOfErrors: number;
  numberOfWarnings: number;
}

interface IItems {
  id: string;
  location: string;
  role: string;
  test: string;
  textValues: string;
}

interface IRules {
  context: string;
  counts: ICounts;
  items: [IItems];
}

interface IPatterns {
  counts: ICounts;
  document: string;
  id: string;
  rules: [IRules];
}

interface IComponentResults {
  counts: ICounts;
  name: string;
  patterns: [IPatterns];
  phase: string;
}

interface IBusinessSchematronValidationResult {
  componentResults: [IComponentResults];
  counts: ICounts;
}

interface IResults {
  category: string;
  code: string;
  description: string;
  fileName: string;
  message: string;
  passed: boolean;
  status: string;
}

interface IBusinessValidationResultsArray {
  countWarnings: number;
  fileName: string;
  itemId: string;
  itemType: string;
  passed: boolean;
  results: [IResults];
}

interface IBusinessValidationResults {
  countErrors: number;
  countFatals: number;
  countPasses: number;
  countWarnings: number;
  inputType: string;
  passed: boolean;
  schemaVersion: string;
  validationMode: string;
  results: [IBusinessValidationResultsArray];
}

export interface IIngestedItem {
  _id: string;
  id: string;
  type: string;
  baseType: string;
  source: string;
  createdDate: Date;
  messageDate: Date;
  publishingItemId: string;
  enrichmentItemId?: string;
  files: [IFiles];
  validationStatus: boolean;
  hasErrors: boolean;
  validationResults?: IValidationResults;
  stage?: string;
  format?: string;
  dac?: string;
  entryDoi?: string;
  classificationCodes?: [string];
  ingestTrigger?: IIngestTrigger;
  businessValidationResults?: IBusinessValidationResults;
  businessSchematronValidationResult?: IBusinessSchematronValidationResult;
  jatsVersion?: null;
  validationComplete?: boolean;
  zippedPackageUrl?: string;
  numTypeSetPages?: null;
  vendor?: string;
  assetType?: string;
  bookFormat?: string;
  doi?: string;
  isbn?: string;
  issueId?: string;
  title?: string;
  metadata?: IMetadata;
  issue?: string;
  volume?: string;
  journalId?: string;
  dead?: boolean;
  transmittalId?: string;
  updatedDate?: Date;
  s3url: string;
  tfJatsVersion?: string;
}
