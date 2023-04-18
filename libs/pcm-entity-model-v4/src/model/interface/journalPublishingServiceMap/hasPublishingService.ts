import { JournalClassification } from './journalClassification';

export interface HasPublishingService {
  _id: string;
  validFrom?: Date;
  validTo?: Date;
  classification?: JournalClassification;
}
