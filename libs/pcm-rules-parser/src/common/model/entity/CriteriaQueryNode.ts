export class CriteriaQueryNode {
  type = 'criteria';
  operator: string;
  values: Array<any>;
  value: string;
  attribute: string;

  constructor(
    operator: string,
    attribute: string,
    value: string,
    values: Array<any>
  ) {
    this.operator = operator;
    this.values = values;
    this.attribute = attribute;
    this.value = value;
  }
}
