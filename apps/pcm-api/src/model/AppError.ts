export class AppError extends Error {
  public info: any;
  public code: number;
  public name = 'AppError';
  constructor(message: string, code: number, info?: any) {
    super(message);
    this.code = code;
    this.info = info;
  }
}
