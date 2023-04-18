import * as skm from '@tandfgroup/secret-key-manager';

import { Config } from '../../config/config';
import { ISecretData } from '../model/interfaces/SecretData';

let secretData: ISecretData = null;

export async function getAPISecretValues(): Promise<ISecretData> {
  if (secretData === null) {
    const region = Config.getPropertyValue('secretRegion');

    const secretsToPull = [
      'hubDBSecretName',
      'dbSecretName',
      'pcmAppSecretName',
      'contentReadUserSecretName',
      'cloudfrontSecretName',
      'cdnSecretUbx'
    ];
    secretData = await Promise.all(
      secretsToPull.map((secretName) =>
        skm.getSecretValues({
          region,
          secretName: Config.getPropertyValue(secretName)
        })
      )
    ).then((sd) => sd.reduce((a, c) => Object.assign(a, c)));
  }

  return secretData;
}
