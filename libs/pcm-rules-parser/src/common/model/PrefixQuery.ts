import { CriteriaQueryNode } from './entity/CriteriaQueryNode';
import { LogicalQueryNode } from './entity/LogicalQueryNode';

export type PrefixQuery = LogicalQueryNode | CriteriaQueryNode;
