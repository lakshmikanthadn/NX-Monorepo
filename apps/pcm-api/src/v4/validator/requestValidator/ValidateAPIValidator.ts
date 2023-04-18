import { GroupedSearchQuery, ProductRule } from '@tandfgroup/pcm-rules-parser';
import { Request } from 'express';

import { AppConstants } from '../../../config/constant';
import { AppError } from '../../../model/AppError';

class ValidateAPIValidator {
  private whitelistedIdentifiers = [
    '_id',
    'identifiers.isbn',
    'identifiers.doi'
  ];
  private whiteListedOperatorForIds = ['IN', 'EQ'];
  private maximumIdsAllowed = 100;

  public validateValidationApi(req: Request): boolean {
    let validationErrors = [];
    const {
      apiVersion,
      action,
      availability,
      rulesList,
      hasCounts,
      ...restOfBody
    } = req.body;
    if (!availability || !availability.name) {
      validationErrors.push(`Availability name is mandatory`);
    }
    const { name, ...restOfAvailability } = availability || {};
    const invalidBodyParams = Object.keys(restOfBody);
    const invalidAvblParams = Object.keys(restOfAvailability);
    if (invalidBodyParams.length > 0) {
      validationErrors.push(`Invalid parameters: ${invalidBodyParams.join()}`);
    }
    if (invalidAvblParams.length > 0) {
      validationErrors.push(
        `Invalid parameters: availability ${invalidAvblParams.join()}`
      );
    }
    if (hasCounts && typeof hasCounts !== 'boolean') {
      validationErrors.push(`Invalid hasCounts value: ${hasCounts}`);
    }
    validationErrors = [].concat(
      validationErrors,
      this.validateAndGetRulesListErrors(rulesList)
    );
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }

  // This method returns error messages as a strings.
  private validateAndGetRulesListErrors(
    rulesList: GroupedSearchQuery[]
  ): string[] {
    // Validate if the rulesList is array
    if (this.isRulesListNotExists(rulesList)) {
      return ['Invalid or missing rulesList.'];
    }

    if (rulesList.length > 1) {
      return ['We support only one rule inside the rulesList'];
    }

    const validationErrors = [];
    let totalIdentifiers = 0;
    // Commenting this as we support only one rule in the request.
    // const uniqueProductTypes = new Set();
    // Validate rules for valid productTypes
    rulesList.forEach((sQuery: GroupedSearchQuery) => {
      let currQueryHasIdentifer = false;
      // Get unique product types for validation.
      if (sQuery.type && !AppConstants.ProductTypesV4.includes(sQuery.type)) {
        validationErrors.push(`Invalid product type : ${sQuery.type}`);
      }
      // Commenting this as we support only one rule in the request.
      // uniqueProductTypes.add(sQuery.type);
      // validate if the attributes is a valid array.
      if (!Array.isArray(sQuery.attributes)) {
        validationErrors.push(
          `Invalid/Missing attributes in the rulesList of ${sQuery.type}`
        );
      }
      if (sQuery.rules) {
        sQuery.rules.forEach((sQRule: ProductRule) => {
          // Validate each rule
          const isLogical = sQRule.type === 'logical';
          const isCriteria = sQRule.type === 'criteria';
          const rule: any = sQRule.rule ? sQRule.rule : {};
          const currCriteriaHasIdentifier =
            this.whitelistedIdentifiers.includes(rule.attribute);
          const currCriteriaHasValidOperator =
            this.whiteListedOperatorForIds.includes(rule.relationship);

          if (isLogical && rule.value !== 'AND') {
            validationErrors.push(
              `Invalid logical operator for ${sQuery.type} ` +
                `at position ${sQRule.position}, only AND is allowed`
            );
          }
          if (this.isCriteriaExists(isCriteria, currCriteriaHasIdentifier)) {
            currQueryHasIdentifer = true;
            totalIdentifiers += rule.values ? rule.values.length : 1;
          }
          if (
            this.isCriteriaValid(
              isCriteria,
              currCriteriaHasIdentifier,
              currCriteriaHasValidOperator
            )
          ) {
            validationErrors.push(
              'Restricted Operator in criteria for ' +
                `${rule.attribute} at position ${sQRule.position}, ` +
                `only ${this.whiteListedOperatorForIds.join()} are allowed`
            );
          }
        });
      }
      if (!currQueryHasIdentifer) {
        validationErrors.push(
          `Missing identifier in Query for ${sQuery.type}, ` +
            `atleast one of ${this.whitelistedIdentifiers.join()} is required.`
        );
      }
    });
    // Validate rules for duplicate type
    if (totalIdentifiers > this.maximumIdsAllowed) {
      validationErrors.push(
        `Only ${this.maximumIdsAllowed} identifiers are allowed.`
      );
    }
    // Commenting this as we support only one rule in the request.
    // if (uniqueProductTypes.size !== rulesList.length) {
    //   validationErrors.push('Multiple rules for same product type');
    // }
    return validationErrors;
  }
  private isCriteriaValid(
    isCriteria,
    currCriteriaHasIdentifier,
    currCriteriaHasValidOperator
  ): boolean {
    return (
      isCriteria && currCriteriaHasIdentifier && !currCriteriaHasValidOperator
    );
  }
  private isCriteriaExists(isCriteria, currCriteriaHasIdentifier): boolean {
    return isCriteria && currCriteriaHasIdentifier;
  }
  private isRulesListNotExists(rulesList): boolean {
    return !rulesList || !Array.isArray(rulesList) || rulesList.length <= 0;
  }
}
export const validateAPIValidator = new ValidateAPIValidator();
