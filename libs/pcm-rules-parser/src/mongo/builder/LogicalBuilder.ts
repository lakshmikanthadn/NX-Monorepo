import * as Logger from 'log4js';

const log = Logger.getLogger('LogicalBuilder');

/**
 * Stage 2
 * Prepare logical query from stage 1 output queryString.
 * takes stage 1 output queryString as input and converts to the template string from Logic Config.
 */
export function logicalBuilder(
  relation: string,
  positionArray: string[],
  criteriaRuleHolder: any[]
): any {
  if (!(relation && positionArray && Array.isArray(positionArray))) {
    log.error(`Invalid logical parameter:: ERROR: `, {
      positionArray,
      relation
    });
    throw new Error('Invalid logical parameter');
  }
  if ((relation === '&' || relation === '|') && positionArray.length >= 2) {
    const logicalObj = {};
    const queryDataArray = positionArray.map(
      (element) => criteriaRuleHolder[element]
    );

    switch (relation) {
      case '&':
        logicalObj['$and'] = queryDataArray;
        break;
      case '|':
        logicalObj['$or'] = queryDataArray;
        break;
      default:
        throw new Error('Invalid Criteria Rule');
    }

    return logicalObj;
  } else {
    log.error(`Invalid Query string at stage 1:: ERROR: `, {
      positionArray,
      relation
    });
    throw new Error('Invalid Query string');
  }
}
