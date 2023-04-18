import { JournalClassification } from '../journalPublishingServiceMap/journalClassification';

type JournalPClassificationTypes = 'cats-article-type' | 'article-type';

export interface HasPublishingServiceRequestClassification
  extends Omit<JournalClassification, 'type'> {
  type: JournalPClassificationTypes;
}

export interface HasPublishingServiceRequest {
  _id: string;
  /**
   * @format date-time
   */
  validFrom?: string;
  /**
   * @format date-time
   */
  validTo?: string;
  classification?: HasPublishingServiceRequestClassification;
}
