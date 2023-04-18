import * as cfSign from 'aws-cloudfront-sign';
import * as path from 'path';

import { Config } from '../../../config/config';
import Logger from '../../../utils/LoggerUtil';
import { getAPISecretValues } from '../../utils/SecretMangerUtils';
import { ICloudFrontSignOptions } from './CloudFrontOptions.Model';

const log = Logger.getLogger('CloudFrontService');

class CloudfrontService {
  private cloudfrontDomainName = Config.getPropertyValue(
    'cloudfrontDomainName'
  );
  private cloudfrontKeypairId = Config.getPropertyValue('cloudfrontKeypairId');
  private defaultCfLinkExpiryTime = 10; // seconds. (10 seconds)
  private cfLinkExpiryTimeOfVideos = 30 * 60; // seconds (30 minutes)
  private cfLinkExpirySecondsForBot = 2 * 24 * 60 * 60; // seconds (Set for 2 days)

  public async getSignedUrlToRead(
    filepath: string,
    options: ICloudFrontSignOptions
  ): Promise<string> {
    log.debug(
      `getSignedUrlToRead path: ${filepath} ${JSON.stringify(options)}`
    );
    const { toRender, filenamePrefix, contentType, isBot, ip } = options;
    let url = new URL(filepath, this.cloudfrontDomainName).href;
    if (!toRender) {
      const filename = filenamePrefix
        ? `${filenamePrefix}_${contentType}${path.parse(filepath).ext}`
        : path.basename(filepath);
      const contentDisposition = encodeURIComponent(
        `attachment; filename="${filename}"`
      );
      url += `?response-content-disposition=${contentDisposition}`;
    }
    const secretData = await getAPISecretValues();
    const signingParams = {
      expireTime:
        new Date().getTime() + this.getExpiration(isBot, contentType) * 1000,
      ipRange: ip,
      keypairId: this.cloudfrontKeypairId,
      privateKeyString: secretData.privateKey // milli-seconds
    };
    // Generating a signed URL
    return cfSign.getSignedUrl(url, signingParams);
  }

  private getExpiration(isBot: boolean, contentType): number {
    if (isBot) {
      return this.cfLinkExpirySecondsForBot;
    } else if (contentType === 'video') {
      return this.cfLinkExpiryTimeOfVideos;
    } else {
      return this.defaultCfLinkExpiryTime;
    }
  }
}

export const cloudfrontService = new CloudfrontService();
