import { Classification } from '../product/classification/classification';
import { Contributor } from '../product/contributor/contributor';
import { Permission } from '../product/permission/permission';

type JournalProductRequestContributorRoles = 'commissioningEditor';
type JournalProductRequestPermissionName = 'open-select' | 'open-access';
type JournalProductRequestPermissionType = 'access';
type LegalOwner = 'US' | 'UK';

export interface JournalProductRequestContributor
  extends Omit<Contributor, 'email'> {
  /**
   * @format email
   */
  email: string;
  roles: JournalProductRequestContributorRoles[];
}

export interface JournalProductRequestPermission
  extends Omit<Permission, 'name' | 'code' | 'text' | 'type'> {
  name: JournalProductRequestPermissionName;
  code: string;
  text?: string;
  type: JournalProductRequestPermissionType;
}

// we have kept it same as parent as we do not to corrupt parent type
// we are overriding group with if/then block in another validator file
export interface JournalProductRequestClassification
  extends Omit<Classification, 'group'> {
  group?: string;
}

interface JournalMetaData {
  legalOwner: LegalOwner;
}

export interface JournalProductRequest {
  type: string;
  journal: JournalMetaData;
  classifications?: JournalProductRequestClassification[];
  contributors?: JournalProductRequestContributor[];
  permissions?: JournalProductRequestPermission[];
}
