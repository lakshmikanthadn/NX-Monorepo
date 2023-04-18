import { Rules } from '../shared/rules';

export interface JSONRulesRequest {
  data: Rules[];
}

export interface JSONRulesResponse {
  type: string;
  rulesString: string;
}
