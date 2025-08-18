import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceAndEnforcementValidatorService } from './compliance-and-enforcement-validator.service';
import { ComplianceAndEnforcement, InitialSubmissionType, AllegedActivity } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementSubmitterDto } from './submitter/submitter.dto';
import { ComplianceAndEnforcementPropertyDto } from './property/property.dto';
import { ComplianceAndEnforcementResponsibleParty, ResponsiblePartyType, FOIPPACategory } from './responsible-parties/responsible-party.entity';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';

describe('ComplianceAndEnforcementValidatorService', () => {
  let service: ComplianceAndEnforcementValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplianceAndEnforcementValidatorService],
    }).compile();

    service = module.get<ComplianceAndEnforcementValidatorService>(ComplianceAndEnforcementValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateSubmission', () => {
    it('should pass validation for a complete submission', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
        intakeNotes: 'Test intake notes',
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];

      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        individualTelephone: '123-456-7890',
        individualEmail: 'john@test.com',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(0);
      expect(result.validatedSubmission).toBeDefined();
    });

    it('should fail validation for missing initial submission type', async () => {
      const cae = new ComplianceAndEnforcement({
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
        intakeNotes: 'Test intake notes',
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];
      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        individualTelephone: '123-456-7890',
        individualEmail: 'john@test.com',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(ServiceValidationException);
      expect(result.errors[0].message).toContain('Initial submission type is required');
      expect(result.validatedSubmission).toBeUndefined();
    });

    it('should fail validation for missing alleged contravention narrative', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
        intakeNotes: 'Test intake notes',
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];
      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        individualTelephone: '123-456-7890',
        individualEmail: 'john@test.com',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(ServiceValidationException);
      expect(result.errors[0].message).toContain('Alleged contravention narrative is required');
      expect(result.validatedSubmission).toBeUndefined();
    });

    it('should fail validation for missing alleged activities', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedContraventionNarrative: 'Test narrative',
        intakeNotes: 'Test intake notes',
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];
      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        individualTelephone: '123-456-7890',
        individualEmail: 'john@test.com',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(ServiceValidationException);
      expect(result.errors[0].message).toContain('At least one alleged activity must be selected');
      expect(result.validatedSubmission).toBeUndefined();
    });

    it('should fail validation for missing intake notes', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];
      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        individualTelephone: '123-456-7890',
        individualEmail: 'john@test.com',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      // Intake notes are now optional, so validation should pass
      expect(result.errors).toHaveLength(0);
      expect(result.validatedSubmission).toBeDefined();
    });

    it('should fail validation for missing properties', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
        intakeNotes: 'Test intake notes',
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [];
      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        individualTelephone: '123-456-7890',
        individualEmail: 'john@test.com',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(ServiceValidationException);
      expect(result.errors[0].message).toContain('At least one property is required');
      expect(result.validatedSubmission).toBeUndefined();
    });

    it('should fail validation for missing responsible parties', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
        intakeNotes: 'Test intake notes',
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];
      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(ServiceValidationException);
      expect(result.errors[0].message).toContain('At least one responsible party is required');
      expect(result.validatedSubmission).toBeUndefined();
    });

    it('should pass validation with no submitters for complaint submissions (submitters are optional)', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.COMPLAINT,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];

      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        // Individual telephone and email are now optional
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(0);
      expect(result.validatedSubmission).toBeDefined();
    });

    it('should fail validation for referral submissions without affiliation (submitters)', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.REFERRAL,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [];
      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];

      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Affiliation is required for referral submissions');
      expect(result.validatedSubmission).toBeUndefined();
    });

    it('should pass validation for referral submissions with affiliation (submitters)', async () => {
      const cae = new ComplianceAndEnforcement({
        initialSubmissionType: InitialSubmissionType.REFERRAL,
        allegedContraventionNarrative: 'Test narrative',
        allegedActivity: [AllegedActivity.BREACH_OF_CONDITION],
      });

      const submitters: ComplianceAndEnforcementSubmitterDto[] = [{
        uuid: 'submitter-uuid',
        isAnonymous: false,
        name: 'John Doe',
        email: 'john@test.com',
        telephoneNumber: '123-456-7890',
        dateAdded: null,
        affiliation: '',
        additionalContactInformation: '',
      }];

      const properties: ComplianceAndEnforcementPropertyDto[] = [{
        uuid: 'test-uuid',
        civicAddress: '123 Test St',
        legalDescription: 'Test legal description',
        localGovernmentUuid: 'lg-uuid',
        localGovernment: null as any,
        regionCode: 'BC',
        latitude: 49.2827,
        longitude: -123.1207,
        areaHectares: 10.5,
        alrPercentage: 75.0,
        ownershipTypeCode: 'SMPL',
        pid: '123456789',
        pin: null,
        alcHistory: '',
        certificateOfTitleUuid: null,
        fileUuid: 'file-uuid',
      }];

      const responsibleParties: ComplianceAndEnforcementResponsibleParty[] = [{
        uuid: 'party-uuid',
        partyType: ResponsiblePartyType.PROPERTY_OWNER,
        foippaCategory: FOIPPACategory.INDIVIDUAL,
        isPrevious: false,
        individualName: 'John Doe',
        individualMailingAddress: '123 Test St',
        ownerSince: new Date(),
        file: null as any,
        fileUuid: 'file-uuid',
      }];

      const result = await service.validateSubmission(cae, submitters, properties, responsibleParties);

      expect(result.errors).toHaveLength(0);
      expect(result.validatedSubmission).toBeDefined();
    });
  });
});
