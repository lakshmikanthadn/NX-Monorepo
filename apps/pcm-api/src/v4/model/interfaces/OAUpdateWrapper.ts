export interface IOAUpdateWrapper {
  orderNumber: string;
  transactionId: string;
  callBackurl: string;
  data: any;
}
export class OaValidationError {
  private code: string;
  private description: string;
  private dataPath: string;

  constructor(description: string) {
    this.code = '';
    this.description = description;
    this.dataPath = '';
  }
}
