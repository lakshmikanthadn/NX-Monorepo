import { Affiliation } from './affiliation';
import { ContributorIdentifier } from './identifier';

export interface Contributor {
  roles: string[];
  identifiers?: ContributorIdentifier;
  givenName?: string;
  familyName?: string;
  fullName?: string;
  email?: string;
  bio?: string;
  orcid?: string;
  collab?: string;
  affiliations?: Affiliation[];
  position: number;
  prefix?: string;
  suffix?: string;
}
