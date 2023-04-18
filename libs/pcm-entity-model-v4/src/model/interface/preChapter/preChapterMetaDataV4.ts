type Status =
  | 'Available'
  | 'Withdrawn'
  | 'Out of Print'
  | 'Del.Thr.Partner'
  | 'Discontinued'
  | 'In Production'
  | 'Planned'
  | 'Out of Stock'
  | 'Deprecated'
  | 'Contracted';
export interface PreChapterMetaData {
  subtitle: string;
  status: Status;
  description?: string;
}
