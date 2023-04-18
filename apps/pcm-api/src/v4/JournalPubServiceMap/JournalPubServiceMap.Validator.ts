import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { cloneDeep, isEqual } from 'lodash';

import { AppError } from '../../model/AppError';
import { NullRemover } from '../utils/NullRemoverUtilsV4';
import { schemaValidator } from '../validator/SchemaValidator';

type PublishingServices =
  RequestModel.JournalPublishingServiceMap['publishingServices'];

class JournalPubServiceMapValidator {
  private schemaId =
    'OpenApiSchema#/definitions/JournalPublishingServiceMapRequest';

  public validate(mappingData: RequestModel.JournalPublishingServiceMap) {
    schemaValidator.validate(this.schemaId, mappingData);
    this.validateDuplicateMapping(mappingData.publishingServices);
    return true;
  }

  /**
   * Checks if the mapping data has duplicate entries.
   * Duplication is completely based on the entire object.
   * Same publishing service is allowed to have more than one entry in the mapping
   * but NOT for the same article type classification.
   * So instead of comparing just the _id of the mapping data, check the entire mapping object.
   *
   * @publishingServiceMapping publishingServiceMapping
   * @returns {boolean}
   *
   */
  private validateDuplicateMapping(
    publishingServiceMapping: PublishingServices
  ): boolean {
    const cleanedData = NullRemover.cleanNullField(
      cloneDeep(publishingServiceMapping)
    );
    const uniqValues = [];
    const duplicatePubServices = [];
    let hasDuplicate = false;
    cleanedData.forEach((pubServiceUnderTest, index) => {
      if (
        uniqValues.some((pubService) =>
          isEqual(pubService, pubServiceUnderTest)
        )
      ) {
        hasDuplicate = true;
        duplicatePubServices.push({
          dataPath: `/publishingServices/${index}`,
          description: 'should NOT have duplicate entry',
          keyword: 'duplicate',
          params: {
            duplicateObject: pubServiceUnderTest
          },
          schemaPath: '#/publishingServices'
        });
      } else {
        uniqValues.push(pubServiceUnderTest);
      }
    });
    if (hasDuplicate) {
      throw new AppError(
        'Duplicate entries in the mapping data.',
        400,
        duplicatePubServices
      );
    }
    return true;
  }
}

export const journalPubServiceMapValidator =
  new JournalPubServiceMapValidator();
