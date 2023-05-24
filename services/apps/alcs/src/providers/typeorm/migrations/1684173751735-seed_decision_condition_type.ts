import { MigrationInterface, QueryRunner } from 'typeorm';

export class seedDecisionConditionType1684173751735
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "alcs"."application_decision_condition_type" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "label", "code", "description") VALUES
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Access', 'ACCE', 'Creating a new parcel requires legal access, associated with subdivision'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Benefit to Agriculture', 'BTOA', 'Provide some action that is a benefit to agriculture'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Bond', 'BOND', 'Financial security to ensure compliance with conditions of approval'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Buffering', 'BUFF', 'Landscape buffering along the edge of an approval to mitigate impacts to/from adjacent properties'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Consolidation', 'CONS', 'Resurveying multiple properties into fewer properties and consolidating by legal title'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Fencing', 'FENC', 'Fencing along the edge of an approval to mitigate impacts to/from adjacent properties'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Homesite Severence', 'HOME', 'Compliance with criteria outlined in Policy L-11'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Inclusion', 'INCL', 'Subject to the inclusion of alternate agriculturally-capable land into the ALR to offset an approval'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Lease', 'LEAS', 'Require a lease agreement to ensure the property is used for agricultural purposes'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Monitored by qualified registered professional', 'MBRP', 'Oversight of the approved use by a qualified professional'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'No Expansion', 'NOEX', 'No expansion beyond the approved footprint or site plan'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'No Homesite Severance', 'NOHS', 'Does not meet criteria outlined in Policy L-11'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Other', 'OTHR', 'Other condition not outlined by standard condition types'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Require Survey Plan', 'RSPL', 'Legal survey plan completed by a BC Land Surveyor provided within a defined time limit'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Covenant', 'COVE', 'Registered on title to ensure ongoing compliance to the conditions of approval'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Right of First Refusal', 'ROFR', 'Gives a party the first opportunity to make an offer in a particular transaction'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Rehabilitation/Reclamation', 'RERC', 'Plan to reclaim or rehabilitate the property to an appropriate agricultural standard'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Final Report', 'FRPT', 'Closing report prepared by a qualified professional outlining condition compliance'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Siting or Site Development Plan', 'SSDP', 'Site plan detailing the approved or proposed use on the landscape'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'SCA Report', 'SCAR', 'Soil Conservation Act (repealed) required reporting'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Status Report', 'SRPT', 'Report prepared by a qualified professional provided on a recurring basis to outline progress'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Time Limit', 'TIME', 'Specified deadline to complete a specific condition or use'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Vegetative Screening', 'VEGS', 'The use of vegetation to mitigate impacts to/from adjacent properties'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Adoption and/or compliance with By-Laws, OCP, etc.', 'ACBO', 'Responsibility to comply with applicable Acts, regulations, bylaws of the local government, and decisions and orders of any person or body having jurisdiction over the land under an enactment'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Substantial Compliance with Submitted Plan', 'SCSP', 'Approved use is consistent with the submitted plan'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Standard Reclamation Conditions', 'STRC', 'Standard reclamation conditions outlined in ALC policies and bulletins'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Administrative Fees', 'AFEE', 'Fees will be charged by the ALC to administrate condition compliance'),
            (DEFAULT, DEFAULT, DEFAULT, 'migration_seed', DEFAULT, 'Non-Transferrable', 'NONT', 'For the sole benefit of the applicant');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "alcs"."application_decision_condition_type"`,
    );
  }
}
