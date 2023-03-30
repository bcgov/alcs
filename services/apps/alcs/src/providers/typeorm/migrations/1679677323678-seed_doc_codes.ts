import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedDocCodes1679677323678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "alcs"."application_document_code" 
        ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description", "oats_code") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Original Application', 'ORIG', 'The submission of the application reviewed by commissioners', 'ORIG'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Acknowledgement Letter', 'ACK', 'Letter acknowledging some input from Applicant', 'ACKL'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Staff Report', 'STFF', 'Staff report provided by Local Governments as part of their review process', 'STFF'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Minutes', 'DECM', 'Minutes of the decision meetings', 'DECM'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Letter', 'DECL', 'The decision letter that was provided to the Applicant', 'DELTR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'ALC Context Map', 'LMAP', 'Map provided to help give context of the application', 'COMAP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Capability Map', 'CMAP', 'Map showing the agriculture capability of the area', 'CAMAP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Amendment Map', 'AMAP', 'Map showing amendment to the ALR boundary', 'AMAP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Letter to LTO', 'LTOL', 'Letter to the Land Title Office', 'LTO'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Correspondence from Public', 'CORP', 'Correspondence received from the Public about this Application', 'CORPU'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Airphoto Map', 'PMAP', 'Map produced using aerial photos', 'AIRP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Survey Plan', 'SURV', 'Survey Plan', 'SURV'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Bonds', 'BOND', 'Financial Instruments', 'BONDS'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reconsideration Request', 'RECO', 'Request to reconsider the application', 'RECON'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Historical Information', 'HIST', 'Historical Information', 'HIST'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Other Correspondence or File Information', 'OTHR', 'Other files that are related', 'OTH'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Unknown Conversion', 'UNKC', 'Document Type is Unknown', 'UNC'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'CEO Order', 'CEOO', 'Order issued by the CEO', 'CEO'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Stop Work Order', 'STWO', 'Compliance and Enforcement stop work order', 'SWO'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notice of Intent Letter', 'NOIL', 'Notice of Intent Decision Letter', 'NOI'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Decision Package', 'DPAC', 'Package containing the documents used for the decision', 'DECPAC'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Planning Reviews', 'PREV', 'ALC Planning Review', 'PLANREV'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proposal Sketch', 'PRSK', 'Sketch of the proposed changes', 'PSK'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Staff Report Package', 'SRPK', 'Package containing staff report and relevant documents', 'SRP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Site Photo', 'PHTO', 'Photo of the Application Site', 'PHOTO'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Compliance and Enforcement Letter', 'CAEL', 'Compliance and Enforcement Letter', 'EL'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agent Agreement', 'AAGR', 'Authorization for agent', 'AA'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agrologists Report', 'AGRO', 'Agrologists Report', 'AR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Agricultural Suitability Report', 'AGSR', 'Agricultural Suitability Report', 'ASR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Applicant Update', 'APPU', 'Update provided by the applicant', 'AU'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Bylaw', 'BYLW', 'Local or First Nation Government Bylaw', 'BYLAW'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Certificate of Title', 'CERT', 'Certificate of Title for Parcels in the Application', 'CT'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Homesite Severance Qualification', 'HOME', 'Homesite Severance Qualification', 'HSQ'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notice of Affected Landowners', 'NOAL', 'Notice provided to landowners who will be impacted', 'NAL'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proof of Notice of Application', 'PONA', 'Proof of Notice of Application', 'PNA'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Professional Report', 'PROR', 'Professional Report', 'PR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Resolution', 'RESO', 'Resolution document provided by Governments', 'RES'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Reclamation Plan', 'RECP', 'Reclamation Plan', 'RP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Site Plan / Cross Section', 'SPCS', 'Cross Section', 'SP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Zoning Plan', 'ZONP', 'L/FNG Zoning Plan', 'ZP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proof of Serving Notice', 'POSN', 'Proof of Serving Notice', 'PSN'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notice of Exclusion Application', 'NOEA', 'Notice of Exclusion Application', 'NEA'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proof of Signage', 'POSA', 'Proof of Signage', 'PS'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Report of Public Hearing', 'ROPH', 'Report of Public Hearing', 'RPH'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Notice of Inclusion Application', 'NOIA', 'Notice of Inclusion Application', 'NIA'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Proof of Advertising', 'POAA', 'Proof of Advertising', 'POA'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Extension Request', 'EXTR', 'Request of Extension from Applicant', 'EXT'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Condition Compliance', 'CONC', 'Evidence of Condition Completion', 'CONCOMP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Additional Information Request', 'AIRA', 'Additional information requests from applicant', 'ADINF'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Site Visit Report', 'SVRA', 'Site Visit Report', 'SVR'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Corporate Summary', 'CORS', 'Corporate Summary Provided for Organizations', 'CS'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Exclusion Meeting Report', 'EXMR', 'Exclusion Meeting Report', 'EXM'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Tenure Map', 'TMAP', 'Map showing Crown Tenures', 'TMAP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'SRW Plan', 'SRWP', 'SRW Plan', 'SRWP'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'SRW Terms Document', 'SRTD', 'SRW Terms Document', 'SRWTD'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Process Document', 'PROD', 'Procedural Process Document', 'PRO'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Referral', 'REFR', 'A referral from another agency', 'REF');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE from "alcs"."application_document_code"');
  }
}
