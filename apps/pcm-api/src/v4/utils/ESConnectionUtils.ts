import { Client } from '@elastic/elasticsearch';
import { Config } from '../../config/config';
const esURL = Config.getPropertyValue('ESUrl');

const esClient = new Client({
  node: esURL
});

export default esClient;
