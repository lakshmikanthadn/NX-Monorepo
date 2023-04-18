import { commonConfigProperties, configProperties } from './env-properties';
/**
 * Loads the config and provides helper methods
 */
export class Config {
  /**
   * Initialize the environment
   */
  public static initialize(): void {
    const env: string = this.getEnvironment() || 'DEV';
    // Note: We are using Object.assign which will re-assign the root level properties only.
    this.config = Object.assign(commonConfigProperties, configProperties[env]);
  }
  /**
   * Get Property Values For A Key
   * @param  {string} key Property Key
   * @return {any}        Can be a string or an object
   */
  public static getPropertyValue(key: string): any {
    return this.config[key];
  }

  private static config: any;
  private static devValuesArray: string[] = [
    'dev',
    'DEV',
    'development',
    'DEVELOPMENT'
  ];
  private static prodValuesArray: string[] = [
    'prod',
    'PROD',
    'production',
    'PRODUCTION'
  ];
  private static uatValuesArray: string[] = ['uat', 'UAT'];
  private static localValuesArray: string[] = ['local', 'LOCAL'];
  private static qaValuesArray: string[] = ['qa', 'QA'];
  private static testValuesArray: string[] = ['test', 'TEST'];

  private static getEnvironment(): string {
    const environment: string = process.env.NODE_ENV;
    if (environment && this.devValuesArray.indexOf(environment) > -1) {
      return 'DEV';
    } else if (environment && this.prodValuesArray.indexOf(environment) > -1) {
      return 'PRODUCTION';
    } else if (environment && this.uatValuesArray.indexOf(environment) > -1) {
      return 'UAT';
    } else if (environment && this.localValuesArray.indexOf(environment) > -1) {
      return 'LOCAL';
    } else if (environment && this.qaValuesArray.indexOf(environment) > -1) {
      return 'QA';
    } else if (environment && this.testValuesArray.indexOf(environment) > -1) {
      return 'TEST';
    }
    return null;
  }
}
Config.initialize();
