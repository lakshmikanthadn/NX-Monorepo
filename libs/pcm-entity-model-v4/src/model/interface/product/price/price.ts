import { CurrencyType } from '../../../common/enum/currency';
export interface Price {
  price: number; // basePrice/discountedPrice
  currency: CurrencyType;
  validTo?: Date;
  validFrom?: Date;
  priceType?: string;
  priceTypeCode?: string;
}
