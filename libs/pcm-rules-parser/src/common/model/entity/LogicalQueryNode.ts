import { CriteriaQueryNode } from './CriteriaQueryNode';

export class LogicalQueryNode {
  type = 'logical';
  operator: string;
  children: Array<CriteriaQueryNode | LogicalQueryNode>;

  constructor(
    operator: string,
    children: Array<CriteriaQueryNode | LogicalQueryNode>
  ) {
    this.operator = operator;
    this.children = children;
  }
}
