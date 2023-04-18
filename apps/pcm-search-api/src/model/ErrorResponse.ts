export interface IErrorResponse {
  metadata: IErrorData;
  data: any;
}

interface IErrorInfo {
  code: number;
  description: string;
  dataPath: string;
}

interface IErrorData {
  _id?: string;
  type?: string;
  transactionId?: string;
  transactionDate?: string;
  error?: any;
  message: string;
  messages?: [IErrorInfo];
}
