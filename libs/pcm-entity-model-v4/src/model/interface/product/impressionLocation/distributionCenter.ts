import { StockStatus } from './stockStatus';

export interface DistributionCenter {
  code?: string;
  location?: string;
  stockStatus: StockStatus[];
  stockStatusNew: StockStatus[];
}
