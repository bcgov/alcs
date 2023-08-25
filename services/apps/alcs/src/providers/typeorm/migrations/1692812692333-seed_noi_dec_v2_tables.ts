import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedNoiDecV2Tables1692812692333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO "alcs"."notice_of_intent_decision_component_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
      (NULL, NOW(), NULL, 'seed-migration', 'seed-migration', 'Removal of Soil', 'ROSO', 'Removal of Soil'),
      (NULL, NOW(), NULL, 'seed-migration', 'seed-migration', 'Placement of Fill', 'POFO', 'Placement of Fill'),
      (NULL, NOW(), NULL, 'seed-migration', 'seed-migration', 'Placement of Fill/Removal of Soil', 'PFRS', 'Placement of Fill/Removal of Soil');
    `);

    await queryRunner.query(`
      INSERT INTO "alcs"."notice_of_intent_decision_condition_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Adoption and/or compliance with By-Laws, OCP, etc.', 'ACBO', 'Responsibility to comply with applicable Acts, regulations, bylaws of the local government, and decisions and orders of any person or body having jurisdiction over the land under an enactment'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Access', 'ACCE', 'Creating a new parcel requires legal access, associated with subdivision'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Administrative Fees', 'AFEE', 'Fees will be charged by the ALC to administrate condition compliance'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Bond', 'BOND', 'Financial security to ensure compliance with conditions of approval'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Benefit to Agriculture', 'BTOA', 'Provide some action that is a benefit to agriculture'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Buffering', 'BUFF', 'Landscape buffering along the edge of an approval to mitigate impacts to/from adjacent properties'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Consolidation', 'CONS', 'Resurveying multiple properties into fewer properties and consolidating by legal title'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Covenant', 'COVE', 'Registered on title to ensure ongoing compliance to the conditions of approval'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Fencing', 'FENC', 'Fencing along the edge of an approval to mitigate impacts to/from adjacent properties'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Final Report', 'FRPT', 'Closing report prepared by a qualified professional outlining condition compliance'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Homesite Severance', 'HOME', 'Compliance with criteria outlined in Policy L-11'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Inclusion', 'INCL', 'Subject to the inclusion of alternate agriculturally-capable land into the ALR to offset an approval'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Lease', 'LEAS', 'Require a lease agreement to ensure the property is used for agricultural purposes'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Monitored by qualified registered professional', 'MBRP', 'Oversight of the approved use by a qualified professional'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'No Expansion', 'NOEX', 'No expansion beyond the approved footprint or site plan'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'No Homesite Severance', 'NOHS', 'Does not meet criteria outlined in Policy L-11'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Non-Transferrable', 'NONT', 'For the sole benefit of the applicant'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Other', 'OTHR', 'Other condition not outlined by standard condition types'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Rehabilitation/Reclamation', 'RERC', 'Plan to reclaim or rehabilitate the property to an appropriate agricultural standard'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Right of First Refusal', 'ROFR', 'Gives a party the first opportunity to make an offer in a particular transaction'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Require Survey Plan', 'RSPL', 'Legal survey plan completed by a BC Land Surveyor provided within a defined time limit'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'SCA Report', 'SCAR', 'Soil Conservation Act (repealed) required reporting'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Substantial Compliance with Submitted Plan', 'SCSP', 'Approved use is consistent with the submitted plan'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Status Report', 'SRPT', 'Report prepared by a qualified professional provided on a recurring basis to outline progress'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Siting or Site Development Plan', 'SSDP', 'Site plan detailing the approved or proposed use on the landscape'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Standard Reclamation Conditions', 'STRC', 'Standard reclamation conditions outlined in ALC policies and bulletins'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Time Limit', 'TIME', 'Specified deadline to complete a specific condition or use'),
        (NULL, NOW(), NULL, 'migration_seed', NULL, 'Vegetative Screening', 'VEGS', 'The use of vegetation to mitigate impacts to/from adjacent properties');
    `);
  }

  public async down(): Promise<void> {
    //No can has
  }
}
