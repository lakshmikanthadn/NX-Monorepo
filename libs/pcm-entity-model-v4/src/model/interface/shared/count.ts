import { FormatCount } from './formatCount';

export interface Count {
  type: string;
  count: number;
  formatsCount?: FormatCount[];
}
