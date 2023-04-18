import { Area } from './area';

export interface Right {
  iso2: string;
  iso3: string;
  isonum: string;
  name: string;
  area?: Area[];
  category: string;
  type: string;
}
