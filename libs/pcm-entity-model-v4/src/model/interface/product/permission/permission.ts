export interface Permission {
  name: string;
  code?: string;
  text: string;
  type: string;
  description?: string;
  validFrom?: Date;
  validTo?: Date;
}
