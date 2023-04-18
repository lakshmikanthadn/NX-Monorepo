import { Affiliation } from '../product/contributor/affiliation';
import { ContributorIdentifier } from '../product/contributor/identifier';
type Roles =
  | 'afterword'
  | 'associate editor'
  | 'associate-editor'
  | 'author'
  | 'author1'
  | 'contributor'
  | 'editor'
  | 'foreword'
  | 'illustrator'
  | 'introduction'
  | 'lead contributor'
  | 'no author'
  | 'postscript'
  | 'preface'
  | 'series editor'
  | 'series-editor'
  | 'translator'
  | 've';
export interface Contributor {
  roles: Roles[];
  identifiers?: ContributorIdentifier;
  givenName: string;
  familyName: string;
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
