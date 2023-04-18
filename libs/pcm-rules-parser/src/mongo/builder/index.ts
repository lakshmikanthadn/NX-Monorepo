import { logicalBuilder } from './LogicalBuilder';
import { relationBuilder } from './RelationBuilder';
import { prepareQueryByRelation } from './RuleBuilder';

export const Builder = {
  logicalBuilder,
  prepareQueryByRelation,
  relationBuilder
};

export { logicalBuilder, prepareQueryByRelation, relationBuilder };
