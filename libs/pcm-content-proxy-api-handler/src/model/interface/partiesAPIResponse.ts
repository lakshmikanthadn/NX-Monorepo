interface Metadata {
  message: string;
  status: string;
}

interface Data {
  parties: string[];
}

export interface PartiesAPIResponse {
  metadata: Metadata;
  data: Data;
}
