export enum ResponsiblePartyType {
  PROPERTY_OWNER = 'Property Owner',
  LESSEE_TENANT = 'Lessee/Tenant',
  OPERATOR = 'Operator',
  CONTRACTOR = 'Contractor',
}

export enum FOIPPACategory {
  INDIVIDUAL = 'Individual',
  ORGANIZATION = 'Organization',
}

export interface ResponsiblePartyDirectorDto {
  uuid: string;
  directorName: string;
  directorMailingAddress: string;
  directorTelephone?: string;
  directorEmail?: string;
}

export interface ResponsiblePartyDto {
  uuid: string;
  partyType: ResponsiblePartyType;
  foippaCategory: FOIPPACategory;
  isPrevious: boolean;

  // Individual fields
  individualName?: string;
  individualMailingAddress?: string;
  individualTelephone?: string;
  individualEmail?: string;
  individualNote?: string;
  
  // Organization fields
  organizationName?: string;
  organizationTelephone?: string;
  organizationEmail?: string;
  organizationNote?: string;
  directors?: ResponsiblePartyDirectorDto[];

  // Property Owner specific
  ownerSince?: number | null;
}

export interface CreateResponsiblePartyDirectorDto {
  directorName: string;
  directorMailingAddress: string;
  directorTelephone?: string;
  directorEmail?: string;
}

export interface UpdateResponsiblePartyDirectorDto {
  directorName?: string;
  directorMailingAddress?: string;
  directorTelephone?: string;
  directorEmail?: string;
}

export interface CreateResponsiblePartyDto {
  partyType: ResponsiblePartyType;
  foippaCategory: FOIPPACategory;
  isPrevious?: boolean;
  fileUuid: string;

  // Individual fields
  individualName?: string;
  individualMailingAddress?: string;
  individualTelephone?: string;
  individualEmail?: string;
  individualNote?: string;
  
  // Organization fields
  organizationName?: string;
  organizationTelephone?: string;
  organizationEmail?: string;
  organizationNote?: string;
  directors?: CreateResponsiblePartyDirectorDto[];

  // Property Owner specific
  ownerSince?: number | null;
}

export interface UpdateResponsiblePartyDto {
  partyType?: ResponsiblePartyType;
  foippaCategory?: FOIPPACategory;
  isPrevious?: boolean;

  // Individual fields
  individualName?: string;
  individualMailingAddress?: string;
  individualTelephone?: string;
  individualEmail?: string;
  individualNote?: string;
  
  // Organization fields
  organizationName?: string;
  organizationTelephone?: string;
  organizationEmail?: string;
  organizationNote?: string;
  directors?: UpdateResponsiblePartyDirectorDto[];

  // Property Owner specific
  ownerSince?: number | null;
}
