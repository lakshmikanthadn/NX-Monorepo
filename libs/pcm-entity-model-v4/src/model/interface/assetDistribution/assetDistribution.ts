export interface AssetDistributionIdentifier {
  doi?: string;
  dac?: string;
  isbn?: string;
  collectionId?: string;
}

export interface Distribution {
  assetType: string;
  name: string;
  status: string;
  transferDate?: Date;
  correlationId?: string;
  location?: string;
  stage?: string;
  messages: string[];
}

export interface AssetDistribution {
  _id: string;
  type: string;
  identifiers: AssetDistributionIdentifier;
  distribution: Distribution[];
}
