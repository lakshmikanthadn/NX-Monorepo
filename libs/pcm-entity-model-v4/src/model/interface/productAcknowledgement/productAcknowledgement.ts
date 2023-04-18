type ACKStatus = 'success' | 'error';
type ACKAppName = 'KORTEXT';
export interface ProductAcknowledgement {
  name: ACKAppName;
  status: ACKStatus;
  correlationId: string;
  messages: string[];
}
