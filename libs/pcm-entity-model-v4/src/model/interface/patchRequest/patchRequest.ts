// We will use it in future
// type OpName = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
type OpName = 'replace';

export interface PatchRequest {
  op: OpName;
  path: string;
  value: string;
}
