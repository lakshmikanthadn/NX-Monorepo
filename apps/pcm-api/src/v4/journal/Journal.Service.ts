import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { cloneDeep } from 'lodash';
import { ISQSQueueUrlData } from '../../v4/model/interfaces/SQSQueueUrlData';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import { schemaValidator } from '../validator/SchemaValidator';

class JournalService {
  private journalProductEventQueue: ISQSQueueUrlData = Config.getPropertyValue(
    'journalProductEventQueue'
  );
  // Only classification data is coming from SF and is based on acronym,
  // so calling the source as journalProductClassificationSource
  private journalProductClassificationSource = 'SALESFORCE';
  private schemaId = 'OpenApiSchema#/definitions/JournalProductRequest';

  /**
   * Update the journal product by using the product identifier
   * @param productIdentifier product identifier
   * @param productIdentifierName product identifier name
   * @param journalData journal data to be updated
   * @returns messageID
   */
  public updateJournalProduct(
    productIdentifier: string,
    journalData: RequestModel.Journal,
    productIdentifierName?: string
  ): Promise<string> {
    return this.updateJournalProductByAcronym(productIdentifier, journalData);
  }

  /**
   * Update the journal product by acronym
   * @param acronym acronym of the journal
   * @param journalData journal data to be updated (supports only classifications)
   * @returns messageID
   */
  private async updateJournalProductByAcronym(
    acronym: string,
    journalData: RequestModel.Journal
  ): Promise<string> {
    schemaValidator.validate(this.schemaId, cloneDeep(journalData));
    const asset = await assetV4Service.getProductByIdentifier(
      'journalAcronym',
      acronym
    );
    if (!asset) {
      throw new AppError(
        `A Journal must exist with journalAcronym` + ` ${acronym}`,
        404
      );
    }
    return eventService.sendProductEvent(
      { identifiers: { journalAcronym: acronym }, ...journalData },
      this.journalProductEventQueue,
      this.journalProductClassificationSource,
      { productId: acronym, productType: journalData.type }
    );
  }
}

export const journalService = new JournalService();
