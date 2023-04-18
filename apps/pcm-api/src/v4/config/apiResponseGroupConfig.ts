import { AppError } from '../../model/AppError';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';

class APIResponseGroupConfig {
  private taxonomyFields: string[] = [
    '_id',
    'name',
    'level',
    'code',
    'parentId'
  ];
  private taxonomyMasterFields: string[] = [
    '_id',
    'name',
    'level',
    'classificationType',
    'code',
    'parentId'
  ];
  private productSmall: string[] = [
    '_id',
    'type',
    'subType',
    'version',
    'title',
    'identifiers'
  ];
  private manuscriptWorkflowSmall: string[] = ['_id', 'version', 'identifiers'];
  private productMedium: string[] = [
    '_id',
    'associatedMedia',
    'availability',
    'categories',
    'contributors',
    'discountGroups',
    'identifiers',
    'permissions',
    'prices',
    'rights',
    'title',
    'type',
    'subType',
    'version'
  ];
  private productLarge: string[] = [
    '_id',
    'associatedMedia',
    'audience',
    'availability',
    'categories',
    'classifications',
    'contributors',
    'discountGroups',
    'identifiers',
    'impressionLocations',
    'isPartOf',
    'isRelatedTo',
    'keywords',
    'permissions',
    'prices',
    'references',
    'rights',
    'title',
    'type',
    'subType',
    'version',
    'transfer',
    '_modifiedDate'
  ];
  private partSmall: string[] = [
    'parts._id',
    'parts.type',
    'parts.position',
    'parts.isFree'
  ];
  private partMedium: string[] = [
    'parts._id',
    'parts.format',
    'parts.isFree',
    'parts.level',
    'parts.position',
    'parts.type',
    'parts.version',
    'parts.curationSource',
    'parts.title'
  ];

  private stagesMedium: string[] = [
    'stages.createdDate',
    'stages.messageDate',
    'stages.source',
    'stages.metadata.originalStatus',
    'stages.status'
  ];

  private scholarlyArticleMedium: string[] = [
    'scholarlyArticle.journal.siteName',
    'scholarlyArticle.journal.journalAcronym',
    'scholarlyArticle.journal.title',
    'scholarlyArticle.status',
    'scholarlyArticle.dates'
  ];

  private bookMetadataSmall: string[] = [];

  private bookMetadataLarge: string[] = ['book'];

  private chapterMetadataSmall: string[] = [];

  private chapterMetadataLarge: string[] = ['chapter'];

  private projectionResponseGroupMapper;
  constructor() {
    this.projectionResponseGroupMapper = {
      allProducts: {
        partMedium: [
          'title',
          'type',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'categories.name',
          'categories.type',
          'book.format',
          'book.subtitle',
          'book.publicationDate',
          'book.publisherImprint',
          'book.plannedPublicationDate',
          'collection.format',
          'collection.subtitle',
          'collection.publicationDate',
          'collection.publisherImprint',
          'collection.plannedPublicationDate',
          'chapter.format',
          'chapter.subtitle',
          'chapter.publicationDate',
          'chapter.publisherImprint',
          'chapter.plannedPublicationDate',
          'set.format',
          'set.subtitle',
          'set.publicationDate',
          'set.publisherImprint',
          'set.plannedPublicationDate',
          'creativeWork.format',
          'creativeWork.subtitle',
          'creativeWork.publicationDate',
          'creativeWork.publisherImprint',
          'creativeWork.plannedPublicationDate',
          'prices',
          'permissions',
          'entryVersion.publicationDate',
          'entryVersion.publisherImprint',
          'entryVersion.plannedPublicationDate',
          'scholarlyArticle.format',
          'scholarlyArticle.subtitle',
          'scholarlyArticle.publicationDate',
          'scholarlyArticle.publisherImprint',
          'scholarlyArticle.plannedPublicationDate',
          'series.format',
          'series.subtitle',
          'series.publicationDate',
          'series.publisherImprint',
          'series.plannedPublicationDate'
        ],
        partSmall: ['_id', 'type', 'identifiers.doi', 'identifiers.isbn']
      },
      book: {
        large: this.productLarge.concat(this.bookMetadataLarge),
        medium: [...this.productMedium, 'book'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'book.format',
          'book.subtitle',
          'book.publicationDate',
          'book.publisherImprint',
          'book.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall.concat(this.bookMetadataSmall)
      },
      chapter: {
        large: this.productLarge.concat(this.chapterMetadataLarge),
        medium: [...this.productMedium, 'chapter'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'chapter.format',
          'chapter.subtitle',
          'chapter.publicationDate',
          'chapter.publisherImprint',
          'chapter.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall.concat(this.chapterMetadataSmall)
      },
      collection: {
        large: [...this.productLarge, 'collection'],
        medium: [...this.productSmall, 'collection'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'collection.format',
          'collection.subtitle',
          'collection.publicationDate',
          'collection.publisherImprint',
          'collection.plannedPublicationDate',
          'categories.name',
          'categories.type',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      },
      creativeWork: {
        large: [...this.productLarge, 'creativeWork'],
        medium: [...this.productSmall, 'creativeWork'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'creativeWork.format',
          'creativeWork.subtitle',
          'creativeWork.publicationDate',
          'creativeWork.publisherImprint',
          'creativeWork.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      },
      entry: {
        large: this.productLarge,
        medium: this.productSmall,
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      },
      entryVersion: {
        large: [...this.productLarge, 'entryVersion'],
        medium: [...this.productSmall, 'entryVersion'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'prices',
          'permissions',
          'entryVersion.publicationDate',
          'entryVersion.publisherImprint',
          'entryVersion.plannedPublicationDate'
        ],
        small: this.productSmall
      },
      journal: {
        large: [...this.productLarge, 'journal'],
        medium: [...this.productSmall, 'journal'],
        small: this.productSmall
      },
      manuscriptWorkflow: {
        large: [...this.manuscriptWorkflowSmall, 'stages'],
        medium: [...this.manuscriptWorkflowSmall, ...this.stagesMedium],
        small: this.manuscriptWorkflowSmall
      },
      part: {
        medium: this.partMedium,
        small: this.partSmall
      },
      preArticle: {
        large: [...this.productLarge, 'scholarlyArticle'],
        medium: [...this.productSmall, ...this.scholarlyArticleMedium],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'scholarlyArticle.format',
          'scholarlyArticle.subtitle',
          'scholarlyArticle.publicationDate',
          'scholarlyArticle.publisherImprint',
          'scholarlyArticle.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      },
      publishingService: {
        large: [...this.productLarge, 'publishingService'],
        medium: [...this.productSmall, 'publishingService'],
        small: this.productSmall
      },
      scholarlyArticle: {
        large: [...this.productLarge, 'scholarlyArticle'],
        medium: [...this.productSmall, 'scholarlyArticle'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'scholarlyArticle.format',
          'scholarlyArticle.subtitle',
          'scholarlyArticle.publicationDate',
          'scholarlyArticle.publisherImprint',
          'scholarlyArticle.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      },
      series: {
        large: [...this.productLarge, 'series'],
        medium: [...this.productSmall, 'series'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'series.format',
          'series.subtitle',
          'series.publicationDate',
          'series.publisherImprint',
          'series.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      },
      set: {
        large: [...this.productLarge, 'set'],
        medium: [...this.productSmall, 'set'],
        partMedium: [
          'title',
          'identifiers.doi',
          'contributors.roles',
          'contributors.fullName',
          'set.format',
          'set.subtitle',
          'set.publicationDate',
          'set.publisherImprint',
          'set.plannedPublicationDate',
          'prices',
          'permissions'
        ],
        small: this.productSmall
      }
    };
  }
  public getProjectionFields(
    productType: string,
    responseGroup: APIResponseGroup
  ): string[] {
    if (!this.projectionResponseGroupMapper[productType]) {
      throw new AppError(
        `Product type - ${productType} is not configured for Response Group.`,
        400
      );
    }
    if (!this.projectionResponseGroupMapper[productType][responseGroup]) {
      throw new Error(
        `Response Group - ${responseGroup} is not configured for Product type - ${productType}`
      );
    }

    return this.projectionResponseGroupMapper[productType][responseGroup];
  }

  public getProjectionFieldsForTaxonomy() {
    return this.taxonomyFields;
  }
  public getProjectionFieldsForTaxonomyMaster() {
    return this.taxonomyMasterFields;
  }
}

export const apiResponseGroupConfig = new APIResponseGroupConfig();
