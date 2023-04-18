import mongoose = require('mongoose');

const FilesSchema = new mongoose.Schema(
  {
    chapterId: { type: String },
    s3Url: { type: String },
    size: { type: Number },
    type: { type: String }
  },
  {
    _id: false
  }
);

const EntriesSchema = new mongoose.Schema(
  {
    code: { type: String },
    messages: [{ type: String }],
    passed: { type: Boolean }
  },
  {
    _id: false
  }
);

const ValidationResultsSchema = new mongoose.Schema(
  {
    createdDate: { type: Date },
    entries: [{ type: EntriesSchema }],
    id: { type: String },
    type: { type: String }
  },
  {
    _id: false
  }
);

const IdentifiersSchema = new mongoose.Schema(
  {
    dac: { type: String },
    doi: { type: String },
    eanCode: { type: String },
    editionId: { type: String },
    epubIsbn: { type: String },
    isbn: { type: String },
    mobiIsbn: { type: String },
    titleId: { type: String },
    webPdfIsbn: { type: String }
  },
  {
    _id: false
  }
);

const CopyrightSchema = new mongoose.Schema(
  {
    holder: { type: String },
    statement: { type: String },
    year: { type: Number }
  },
  {
    _id: false
  }
);

const KeywordsSchema = new mongoose.Schema(
  {
    type: { type: String },
    value: { type: String }
  },
  {
    _id: false
  }
);

const contributersSchema = new mongoose.Schema(
  {
    givenNames: { type: String },
    surname: { type: String },
    type: { type: String }
  },
  {
    _id: false
  }
);

const RefrencesSchema = new mongoose.Schema(
  {
    articleTitle: { type: String },
    chapterTitle: { type: String },
    conferenceName: { type: String },
    contributors: [{ type: contributersSchema }],
    edition: { type: String },
    firstPage: { type: String },
    id: { type: String },
    issue: { type: String },
    lastPage: { type: String },
    publicationDate: { type: String },
    publicationType: { type: String },
    publisherLocation: { type: String },
    publisherName: { type: String },
    source: { type: String },
    volume: { type: String }
  },
  {
    _id: false
  }
);

const ChapterSchema = new mongoose.Schema(
  {
    abstractText: { type: String },
    doi: { type: String },
    firstPage: { type: String },
    id: { type: String },
    keywords: [{ type: KeywordsSchema }],
    label: { type: String },
    lastPage: { type: String },
    references: [{ type: RefrencesSchema }],
    relatedObjects: { type: String },
    subtitle: { type: String },
    title: { type: String },
    type: { type: String }
  },
  {
    _id: false
  }
);

const MetadataBodySchema = new mongoose.Schema(
  {
    chapters: [{ type: ChapterSchema }],
    sectionType: { type: String }
  },
  {
    _id: false
  }
);

const ClassificationEntriesSchema = new mongoose.Schema(
  {
    description: { type: String },
    level: { type: String }
  },
  {
    _id: false
  }
);

const classificationsSchema = new mongoose.Schema(
  {
    entries: [{ type: ClassificationEntriesSchema }],
    type: { type: String }
  },
  {
    _id: false
  }
);

const ContributersSchema = new mongoose.Schema(
  {
    bio: { type: String },
    givenNames: { type: String },
    orcid: { type: String },
    surname: { type: String },
    type: { type: String }
  },
  {
    _id: false
  }
);

const DistributionCentersSchema = new mongoose.Schema(
  {
    discountGroup: { type: String },
    discountGroupCode: { type: String },
    distributionCenter: { type: String },
    distributionCenterCode: { type: String },
    plannedPublicationDate: { type: String },
    primaryDistributionCenter: { type: String },
    publicationDate: { type: String },
    status: { type: String },
    statusCode: { type: String }
  },
  {
    _id: false
  }
);

const ExclusionListSchema = new mongoose.Schema(
  {
    iso2: { type: String },
    iso3: { type: String },
    isonum: { type: String },
    name: { type: String }
  },
  {
    _id: false
  }
);

const DistributionRightsSchema = new mongoose.Schema(
  {
    exclusionList: [{ type: ExclusionListSchema }]
  },
  {
    _id: false
  }
);

const FrontSchema = new mongoose.Schema(
  {
    chapters: [{ type: ChapterSchema }],
    sectionType: { type: String }
  },
  {
    _id: false
  }
);

const MarketingRestrictionsSchema = new mongoose.Schema(
  {
    noCanada: { type: Boolean },
    noLatAm: { type: Boolean },
    noROW: { type: Boolean },
    noUS: { type: Boolean }
  },
  {
    _id: false
  }
);

const NetbaseClassificationsSchema = new mongoose.Schema(
  {
    code: { type: String },
    description: { type: String }
  },
  {
    _id: false
  }
);

const OriginatorsSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    originatorType: { type: String },
    originatorTypeCode: { type: String },
    sortOrder: { type: String }
  },
  {
    _id: false
  }
);

const PricingSchema = new mongoose.Schema(
  {
    currency: { type: String },
    price: { type: String },
    priceType: { type: String },
    priceTypeCode: { type: String },
    validFrom: { type: String }
  },
  {
    _id: false
  }
);

const SubjectClassificationSchema = new mongoose.Schema(
  {
    code: { type: String },
    description: { type: String },
    level: { type: String },
    priority: { type: String }
  },
  {
    _id: false
  }
);

const MetadataSchema = new mongoose.Schema(
  {
    abstractText: { type: String },
    bindingStyle: { type: String },
    bindingStyleCode: { type: String },
    body: { type: MetadataBodySchema },
    classifications: [{ type: classificationsSchema }],
    contributors: [{ type: ContributersSchema }],
    copyright: { type: CopyrightSchema },
    copyrightYear: { type: String },
    dac: { type: String },
    distributionCenters: [{ type: DistributionCentersSchema }],
    distributionRights: { type: DistributionRightsSchema },
    division: { type: String },
    divisionCode: { type: String },
    doi: { type: String },
    drm: { type: String },
    ebookRestriction: { type: String },
    ebookRestrictionCode: { type: String },
    edition: { type: String },
    firstPublishedYear: { type: String },
    format: { type: String },
    front: { type: FrontSchema },
    groupOfCompany: { type: String },
    identifiers: { type: IdentifiersSchema },
    infoRestrict: { type: String },
    infoRestrictType: { type: String },
    isBookSet: { type: Boolean },
    isbn: { type: String },
    keywords: [{ type: KeywordsSchema }],
    marketingRestrictions: { type: MarketingRestrictionsSchema },
    netbaseClassifications: [{ type: NetbaseClassificationsSchema }],
    notSoldSeparately: { type: Boolean },
    openAccess: { type: Boolean },
    orderNo: { type: String },
    originators: [{ type: OriginatorsSchema }],
    pageCount: { type: Number },
    plannedPublicationDate: { type: String },
    podSuitable: { type: Boolean },
    pricing: [{ type: PricingSchema }],
    publicationDate: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { type: String },
    publisherName: { type: String },
    readyForMarket: { type: Boolean },
    refrences: [{ type: RefrencesSchema }],
    shortBlurb: { type: String },
    status: { type: String },
    statusCode: { type: String },
    subjectClassifications: [{ type: SubjectClassificationSchema }],
    subtitle: { type: String },
    textType: { type: String },
    textTypeCode: { type: String },
    title: { type: String },
    version: { type: String },
    versionType: { type: String },
    versionTypeCode: { type: String }
  },
  {
    _id: false
  }
);

const ResultsSchema = new mongoose.Schema(
  {
    category: { type: String },
    code: { type: String },
    description: { type: String },
    fileName: { type: String },
    message: { type: String },
    passed: { type: Boolean },
    status: { type: String }
  },
  {
    _id: false
  }
);

const BusinessValidationResultsArraySchema = new mongoose.Schema(
  {
    countWarnings: { type: Number },
    fileName: { type: String },
    itemId: { type: String },
    itemType: { type: String },
    passed: { type: Boolean },
    results: [{ type: ResultsSchema }]
  },
  {
    _id: false
  }
);

const BusinessValidationResultsSchema = new mongoose.Schema(
  {
    countErrors: { type: Number },
    countFatals: { type: Number },
    countPasses: { type: Number },
    countWarnings: { type: Number },
    inputType: { type: String },
    passed: { type: Boolean },
    results: [{ type: BusinessValidationResultsArraySchema }],
    schemaVersion: { type: String },
    validationMode: { type: String }
  },
  {
    _id: false
  }
);

const IngestTriggerSchema = new mongoose.Schema(
  {
    applicationName: { type: String },
    articleId: { type: String },
    assetState: { type: String },
    assetType: { type: String },
    businessProcess: { type: String },
    eTag: { type: String },
    fileEncoding: { type: String },
    fileName: { type: String },
    issue: { type: String },
    journalAcronym: { type: String },
    mimeType: { type: String },
    object: { type: String },
    reqDate: { type: String },
    reqUID: { type: String },
    s3Reference: { type: String },
    size: { type: String },
    source: { type: String },
    sourceFileName: { type: String },
    typeSetterS3Bucket: { type: String },
    vendor: { type: String },
    versionType: { type: String },
    volume: { type: String }
  },
  {
    _id: false
  }
);

export const IngestedItem: mongoose.Schema = new mongoose.Schema({
  _id: { type: String },
  assetType: { type: String },
  baseType: { type: String },
  bookFormat: { type: String },
  businessSchematronValidationResult: { type: BusinessValidationResultsSchema },
  businessValidationResults: { type: BusinessValidationResultsSchema },
  classificationCodes: [{ type: String }],
  createdDate: { type: Date },
  dac: { type: String },
  dead: { type: Boolean },
  doi: { type: String },
  enrichmentItemId: { type: String },
  entryDoi: { type: String },
  files: { type: FilesSchema },
  format: { type: String },
  hasErrors: { type: Boolean },
  ingestTrigger: { type: IngestTriggerSchema },
  isbn: { type: String },
  issue: { type: String },
  issueId: { type: String },
  jatsVersion: { type: String },
  journalId: { type: String },
  messageDate: { type: Date },
  metadata: { type: MetadataSchema },
  numTypeSetPages: { type: String },
  publishingItemId: { type: String },
  s3url: { type: String },
  source: { type: String },
  stage: { type: String },
  tfJatsVersion: { type: String },
  title: { type: String },
  transmittalId: { type: String },
  type: { type: String },
  updatedDate: { type: Date },
  validationComplete: { type: Boolean },
  validationResults: { type: ValidationResultsSchema },
  validationStatus: { type: Boolean },
  vendor: { type: String },
  volume: { type: String },
  zippedPackageUrl: { type: String }
});
