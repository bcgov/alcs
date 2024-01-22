import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import {
  DocumentCode,
  DOCUMENT_TYPE,
} from '../../document/document-code.entity';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import {
  OWNER_TYPE,
  OwnerType,
} from '../../common/owner-type/owner-type.entity';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationSubmissionValidatorService } from './application-submission-validator.service';
import { ApplicationSubmission } from './application-submission.entity';
import { CovenantTransferee } from './covenant-transferee/covenant-transferee.entity';
import { CovenantTransfereeService } from './covenant-transferee/covenant-transferee.service';

function includesError(errors: Error[], target: Error) {
  return errors.some((error) => error.message === target.message);
}

describe('ApplicationSubmissionValidatorService', () => {
  let service: ApplicationSubmissionValidatorService;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockCovenantTransfereeService: DeepMocked<CovenantTransfereeService>;

  beforeEach(async () => {
    mockLGService = createMock();
    mockAppParcelService = createMock();
    mockAppDocumentService = createMock();
    mockCovenantTransfereeService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionValidatorService,
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: CovenantTransfereeService,
          useValue: mockCovenantTransfereeService,
        },
      ],
    }).compile();

    mockLGService.list.mockResolvedValue([]);
    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockAppDocumentService.getApplicantDocuments.mockResolvedValue([]);

    service = module.get<ApplicationSubmissionValidatorService>(
      ApplicationSubmissionValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an error for missing applicant', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('should return an error for missing purpose', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(includesError(res.errors, new Error('Missing purpose'))).toBe(true);
  });

  it('should return an error for no parcels', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('provide errors for invalid application parcel', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      ownershipTypeCode: 'SMPL',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Invalid Parcel ${parcel.uuid}`),
      ),
    ).toBe(true);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Parcel has no Owners ${parcel.uuid}`),
      ),
    ).toBe(true);
    expect(
      includesError(
        res.errors,
        new ServiceValidationException(
          `Parcel is missing certificate of title ${parcel.uuid}`,
        ),
      ),
    ).toBe(true);
    expect(
      includesError(
        res.errors,
        new ServiceValidationException(
          `Fee Simple Parcel ${parcel.uuid} has no PID`,
        ),
      ),
    ).toBe(true);
  });

  it('should report an invalid PID', async () => {
    const application = new ApplicationSubmission({
      owners: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      ownershipTypeCode: 'SMPL',
      pid: '1251251',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(application);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Parcel ${parcel.uuid} has invalid PID`),
      ),
    ).toBe(true);
  });

  it('should require certificate of title and crown description for CRWN parcels with PID and with CRWN owners', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [
        new ApplicationOwner({
          type: new OwnerType({
            code: OWNER_TYPE.CROWN,
          }),
        }),
      ],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      ownershipTypeCode: 'CRWN',
      pid: '12512',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Parcel is missing certificate of title ${parcel.uuid}`),
      ),
    ).toBe(true);
  });

  it('should return an error for no primary contact', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Application has no primary contact`),
      ),
    ).toBe(true);
  });

  it('should return errors for an invalid third party agent', async () => {
    const mockOwner = new ApplicationOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.AGENT,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const applicationSubmission = new ApplicationSubmission({
      owners: [mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Invalid Third Party Agent Information`),
      ),
    ).toBe(true);
  });

  it('should require an authorization letter for more than one owner', async () => {
    const mockOwner = new ApplicationOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.AGENT,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const applicationSubmission = new ApplicationSubmission({
      owners: [mockOwner, mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Application has no authorization letters`),
      ),
    ).toBe(true);
  });

  it('should not require an authorization letter for a single owner', async () => {
    const mockOwner = new ApplicationOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.INDIVIDUAL,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const applicationSubmission = new ApplicationSubmission({
      owners: [mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
    });
    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([
      new ApplicationParcel({
        owners: [mockOwner],
      }),
    ]);

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Application has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should not require an authorization letter when contact is goverment', async () => {
    const mockOwner = new ApplicationOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.INDIVIDUAL,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });

    const governmentOwner = new ApplicationOwner({
      uuid: 'government-owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.GOVERNMENT,
      }),
      firstName: 'Govern',
      lastName: 'Ment',
    });

    const applicationSubmission = new ApplicationSubmission({
      owners: [mockOwner, governmentOwner],
      primaryContactOwnerUuid: governmentOwner.uuid,
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Application has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should not have an authorization letter error when one is provided', async () => {
    const mockOwner = new ApplicationOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.INDIVIDUAL,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const application = new ApplicationSubmission({
      owners: [mockOwner, mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.AUTHORIZATION_LETTER,
        }),
      }),
    ];
    mockAppDocumentService.getApplicantDocuments.mockResolvedValue(documents);

    const res = await service.validateSubmission(application);

    expect(
      includesError(
        res.errors,
        new Error(`Application has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should produce an error for missing local government', async () => {
    const application = new ApplicationSubmission({
      owners: [],
    });

    const res = await service.validateSubmission(application);

    expect(
      includesError(
        res.errors,
        new Error('Application has no local government'),
      ),
    ).toBe(true);
  });

  it('should accept local government when its valid', async () => {
    const mockLg = new LocalGovernment({
      uuid: 'lg-uuid',
      name: 'lg',
      bceidBusinessGuid: 'CATS',
      isFirstNation: false,
    });
    mockLGService.list.mockResolvedValue([mockLg]);

    const application = new ApplicationSubmission({
      owners: [],
      localGovernmentUuid: mockLg.uuid,
    });

    const res = await service.validateSubmission(application);

    expect(
      includesError(
        res.errors,
        new Error(
          `Selected local government is setup in portal ${mockLg.name}`,
        ),
      ),
    ).toBe(false);
  });

  it('should not have land use errors when all fields are filled', async () => {
    const application = new ApplicationSubmission({
      owners: [],
      parcelsAgricultureDescription: 'VALID',
      parcelsAgricultureImprovementDescription: 'VALID',
      parcelsNonAgricultureUseDescription: 'VALID',
      northLandUseType: 'VALID',
      northLandUseTypeDescription: 'VALID',
      eastLandUseType: 'VALID',
      eastLandUseTypeDescription: 'VALID',
      southLandUseType: 'VALID',
      southLandUseTypeDescription: 'VALID',
      westLandUseType: 'VALID',
      westLandUseTypeDescription: 'VALID',
    });

    const res = await service.validateSubmission(application);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel Description`)),
    ).toBe(false);
    expect(
      includesError(res.errors, new Error(`Invalid Adjacent Parcels`)),
    ).toBe(false);
  });

  it('should have land use errors when not all fields are filled', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
      parcelsAgricultureDescription: undefined,
      parcelsAgricultureImprovementDescription: 'VALID',
      parcelsNonAgricultureUseDescription: 'VALID',
      northLandUseType: undefined,
      northLandUseTypeDescription: 'VALID',
      eastLandUseType: 'VALID',
      eastLandUseTypeDescription: 'VALID',
      southLandUseType: 'VALID',
      southLandUseTypeDescription: 'VALID',
      westLandUseType: undefined,
      westLandUseTypeDescription: 'VALID',
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel Description`)),
    ).toBe(true);
    expect(
      includesError(res.errors, new Error(`Invalid Adjacent Parcels`)),
    ).toBe(true);
  });

  it('should report error for document missing type', async () => {
    const incompleteDocument = new ApplicationDocument({
      type: undefined,
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });

    const documents = [incompleteDocument];
    mockAppDocumentService.getApplicantDocuments.mockResolvedValue(documents);

    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing type`),
      ),
    ).toBe(true);
  });

  it('should report error for other document missing description', async () => {
    const incompleteDocument = new ApplicationDocument({
      type: new DocumentCode({
        code: DOCUMENT_TYPE.OTHER,
      }),
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
      description: undefined,
    });
    const application = new ApplicationSubmission({
      owners: [],
    });

    const documents = [incompleteDocument];
    mockAppDocumentService.getApplicantDocuments.mockResolvedValue(documents);

    const res = await service.validateSubmission(application);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing description`),
      ),
    ).toBe(true);
  });

  describe('NFU Applications', () => {
    it('should report no errors when all information is present and there is fill', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        nfuHectares: 1.5125,
        purpose: 'VALID',
        nfuOutsideLands: 'VALID',
        nfuAgricultureSupport: 'VALID',
        nfuWillImportFill: true,
        nfuFillTypeDescription: 'VALID',
        nfuFillOriginDescription: 'VALID',
        nfuTotalFillArea: 0.0,
        nfuMaxFillDepth: 1.5125,
        nfuAverageFillDepth: 1261.21,
        nfuFillVolume: 742.1,
        nfuProjectDuration: '1 day',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`NFU Proposal incomplete`)),
      ).toBe(false);

      expect(
        includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
      ).toBe(false);
    });

    it('should not report errors when there is no fill', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        nfuHectares: 1.5125,
        purpose: 'VALID',
        nfuOutsideLands: 'VALID',
        nfuAgricultureSupport: 'VALID',
        nfuWillImportFill: false,
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`NFU Proposal incomplete`)),
      ).toBe(false);

      expect(
        includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        nfuHectares: null,
        nfuOutsideLands: 'VALID',
        nfuAgricultureSupport: 'VALID',
        nfuWillImportFill: true,
        nfuFillTypeDescription: 'VALID',
        nfuFillOriginDescription: null,
        nfuTotalFillArea: 0.0,
        nfuMaxFillDepth: 1.5125,
        nfuAverageFillDepth: 121,
        nfuFillVolume: 742.1,
        nfuProjectDuration: '1 day',
        typeCode: 'NFUP',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`NFU Proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
      ).toBe(true);
    });
  });

  describe('TUR Applications', () => {
    it('should report errors when information is missing', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        turAgriculturalActivities: 'turAgriculturalActivities',
        turReduceNegativeImpacts: 'turReduceNegativeImpacts',
        typeCode: 'TURP',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`TUR Proposal incomplete`)),
      ).toBe(true);
    });
  });

  describe('ROSO Applications', () => {
    it('should not have an error when base information is filled correctly', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilReduceNegativeImpacts: 'soilReduceNegativeImpacts',
        soilIsFollowUp: false,
        soilAlreadyRemovedVolume: 5,
        soilAlreadyRemovedMaximumDepth: 5,
        soilToRemoveMaximumDepth: 5,
        soilAlreadyRemovedAverageDepth: 5,
        soilAlreadyRemovedArea: 5,
        soilToRemoveAverageDepth: 5,
        soilToRemoveVolume: 5,
        soilToRemoveArea: 5,
        soilTypeRemoved: 'soilTypeRemoved',
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`ROSO Proposal incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilReduceNegativeImpacts: null,
        soilToRemoveVolume: null,
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`ROSO Proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`ROSO Soil Table Incomplete`)),
      ).toBe(true);
    });

    it('should require NOIDs or ApplicationIDs', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO Proposal missing Application or NOI IDs`),
        ),
      ).toBe(true);
    });

    it('should complain about missing files', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Proposal Map / Site Plan`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Cross Section Diagrams`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Reclamation Plans`),
        ),
      ).toBe(true);
    });
  });

  describe('POFO Applications', () => {
    it('should not have errors when base information is filled correctly', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilReduceNegativeImpacts: 'soilReduceNegativeImpacts',
        soilIsFollowUp: false,
        soilAlreadyPlacedVolume: 5,
        soilAlreadyPlacedMaximumDepth: 5,
        soilToPlaceMaximumDepth: 5,
        soilAlreadyPlacedAverageDepth: 5,
        soilAlreadyPlacedArea: 5,
        soilToPlaceAverageDepth: 5,
        soilToPlaceVolume: 5,
        soilToPlaceArea: 5,
        soilAlternativeMeasures: 'soilAlternativeMeasures',
        soilFillTypeToPlace: 'soilFillTypeToPlace',
        typeCode: 'POFO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`POFO Proposal incomplete`)),
      ).toBe(false);

      expect(
        includesError(res.errors, new Error(`POFO Soil Table Incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilFillTypeToPlace: null,
        soilReduceNegativeImpacts: 'soilReduceNegativeImpacts',
        soilToPlaceArea: null,
        typeCode: 'POFO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`POFO Proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`POFO Soil Table Incomplete`)),
      ).toBe(true);
    });

    it('should require NOI IDs or ApplicationIDs', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'POFO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`POFO Proposal missing Application or NOI IDs`),
        ),
      ).toBe(true);
    });

    it('should complain about missing files', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'POFO',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`POFO proposal missing Proposal Map / Site Plan`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`POFO proposal missing Cross Section Diagrams`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`POFO proposal missing Reclamation Plans`),
        ),
      ).toBe(true);
    });
  });

  describe('PFRS Applications', () => {
    it('should not have errors when base information is filled correctly', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        purpose: 'purpose',
        soilReduceNegativeImpacts: 'soilReduceNegativeImpacts',
        soilIsFollowUp: false,
        soilAlreadyPlacedVolume: 5,
        soilAlreadyPlacedMaximumDepth: 5,
        soilToPlaceMaximumDepth: 5,
        soilAlreadyPlacedAverageDepth: 5,
        soilAlreadyPlacedArea: 5,
        soilToPlaceAverageDepth: 5,
        soilToPlaceVolume: 5,
        soilToPlaceArea: 5,
        soilAlternativeMeasures: 'soilAlternativeMeasures',
        soilFillTypeToPlace: 'soilFillTypeToPlace',
        typeCode: 'PFRS',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`PFRS Proposal incomplete`)),
      ).toBe(false);

      expect(
        includesError(res.errors, new Error(`PFRS Soil Table Incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        purpose: 'purpose',
        soilFillTypeToPlace: null,
        soilReduceNegativeImpacts: 'soilReduceNegativeImpacts',
        soilToPlaceArea: null,
        typeCode: 'PFRS',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`PFRS Proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`PFRS Soil Table Incomplete`)),
      ).toBe(true);
    });

    it('should require NOI IDs or ApplicationIDs', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'PFRS',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`PFRS Proposal missing Application or NOI IDs`),
        ),
      ).toBe(true);
    });

    it('should complain about missing files', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'PFRS',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`PFRS proposal missing Proposal Map / Site Plan`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`PFRS proposal missing Cross Section Diagrams`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`PFRS proposal missing Reclamation Plans`),
        ),
      ).toBe(true);
    });

    it('should require a notice of work for both mining and notice true', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        soilIsFollowUp: true,
        soilIsExtractionOrMining: true,
        soilHasSubmittedNotice: true,
        typeCode: 'PFRS',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(
            `PFRS proposal has yes to notice of work but is not attached`,
          ),
        ),
      ).toBe(true);
    });
  });

  describe('INCL Applications', () => {
    it('should require basic fields to be complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'INCL',
        inclImprovements: null,
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal missing inclusion fields`),
        ),
      ).toBe(true);
    });

    it('should be happy if submission is complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        applicant: 'applicant',
        purpose: 'purpose',
        typeCode: 'INCL',
        inclImprovements: 'inclImprovements',
        inclAgricultureSupport: 'inclAgricultureSupport',
        inclExclHectares: 2,
        inclGovernmentOwnsAllParcels: true,
      });

      const documents = [
        new ApplicationDocument({
          typeCode: DOCUMENT_TYPE.PROPOSAL_MAP,
          type: new DocumentCode({
            code: DOCUMENT_TYPE.PROPOSAL_MAP,
          }),
        }),
      ];
      mockAppDocumentService.getApplicantDocuments.mockResolvedValue(documents);

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal missing inclusion fields`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing proposal map / site plan`),
        ),
      ).toBe(false);
    });

    it('should require documents when government does not own all parcels', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        inclGovernmentOwnsAllParcels: false,
        typeCode: 'INCL',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing proof of advertising`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing proof of signage`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing report of public hearing`),
        ),
      ).toBe(true);
    });

    it('should note require documents when government owns all parcels', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        inclGovernmentOwnsAllParcels: true,
        typeCode: 'INCL',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing proof of advertising`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing proof of signage`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`INCL proposal is missing report of public hearing`),
        ),
      ).toBe(false);
    });
  });

  describe('EXCL Applications', () => {
    it('should require basic fields to be complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'EXCL',
        prescribedBody: null,
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal missing exclusion fields`),
        ),
      ).toBe(true);
    });

    it('should be happy if basic fields are complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        applicant: 'applicant',
        purpose: 'purpose',
        typeCode: 'EXCL',
        prescribedBody: 'inclImprovements',
        exclShareGovernmentBorders: false,
        inclExclHectares: 2,
        exclWhyLand: 'exclWhyLand',
      });

      const documents = [
        new ApplicationDocument({
          typeCode: DOCUMENT_TYPE.PROPOSAL_MAP,
          type: new DocumentCode({
            code: DOCUMENT_TYPE.PROPOSAL_MAP,
          }),
        }),
      ];
      mockAppDocumentService.getApplicantDocuments.mockResolvedValue(documents);

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal missing inclusion fields`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing proposal map / site plan`),
        ),
      ).toBe(false);
    });

    it('should require all documents', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'EXCL',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing proof of advertising`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing proof of signage`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing report of public hearing`),
        ),
      ).toBe(true);
    });

    it('should be happy if all documents are provided', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        inclGovernmentOwnsAllParcels: true,
        typeCode: 'EXCL',
      });

      const documents = [
        new ApplicationDocument({
          typeCode: DOCUMENT_TYPE.PROOF_OF_ADVERTISING,
          type: new DocumentCode({
            code: DOCUMENT_TYPE.PROOF_OF_ADVERTISING,
          }),
        }),
        new ApplicationDocument({
          typeCode: DOCUMENT_TYPE.PROOF_OF_SIGNAGE,
          type: new DocumentCode({
            code: DOCUMENT_TYPE.PROOF_OF_SIGNAGE,
          }),
        }),
        new ApplicationDocument({
          typeCode: DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING,
          type: new DocumentCode({
            code: DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING,
          }),
        }),
      ];
      mockAppDocumentService.getApplicantDocuments.mockResolvedValue(documents);

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing proof of advertising`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing proof of signage`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`EXCL proposal is missing report of public hearing`),
        ),
      ).toBe(false);
    });
  });

  describe('SUBD Applications', () => {
    it('should require basic fields to be complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'SUBD',
        subdSuitability: null,
        subdAgricultureSupport: null,
        subdProposedLots: [],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`SUBD application is not complete`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`SUBD application has no proposed lots`),
        ),
      ).toBe(true);
    });

    it('should be happy if basic fields are complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'SUBD',
        subdSuitability: 'subdSuitability',
        subdAgricultureSupport: 'subdAgricultureSupport',
        subdProposedLots: [
          {
            type: 'Lot',
            size: 0,
            alrArea: null,
            planNumbers: null,
          },
        ],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`SUBD application is not complete`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`SUBD application has no proposed lots`),
        ),
      ).toBe(false);
    });

    it('should require homesite severance when set to true', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'SUBD',
        subdIsHomeSiteSeverance: true,
        subdProposedLots: [],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(
            `SUBD declared homesite severance but does not have required document`,
          ),
        ),
      ).toBe(true);
    });

    it('should accept matching parcel sizes', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'SUBD',
        subdProposedLots: [
          {
            type: 'Lot',
            size: 6,
            planNumbers: null,
            alrArea: null,
          },
          {
            type: 'Lot',
            size: 6,
            planNumbers: null,
            alrArea: null,
          },
        ],
      });

      mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([
        new ApplicationParcel({
          mapAreaHectares: 12,
          owners: [],
        }),
      ]);

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`SUBD parcels area is different from proposed lot area`),
        ),
      ).toBe(false);
    });

    it('should reject mismatched parcel sizes', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'SUBD',
        subdProposedLots: [
          {
            type: 'Lot',
            size: 4,
            planNumbers: null,
            alrArea: null,
          },
          {
            type: 'Lot',
            size: 6,
            planNumbers: null,
            alrArea: null,
          },
        ],
      });

      mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([
        new ApplicationParcel({
          mapAreaHectares: 12,
          owners: [],
        }),
      ]);

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`SUBD parcels area is different from proposed lot area`),
        ),
      ).toBe(true);
    });
  });

  describe('COVE Applications', () => {
    beforeEach(() => {
      mockCovenantTransfereeService.fetchBySubmissionUuid.mockResolvedValue([]);
    });

    it('should require basic fields to be complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'COVE',
        coveAreaImpacted: null,
        coveFarmImpact: null,
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`COVE proposal missing covenant fields`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`COVE proposal is is missing covenant transferees`),
        ),
      ).toBe(true);
    });

    it('should be happy if basic fields are complete', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'COVE',
        coveAreaImpacted: 1.512,
        coveFarmImpact: 'Farming impact',
        coveHasDraft: false,
      });
      mockCovenantTransfereeService.fetchBySubmissionUuid.mockResolvedValue([
        new CovenantTransferee(),
      ]);

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`COVE proposal missing covenant fields`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`COVE proposal is is missing covenant transferees`),
        ),
      ).toBe(false);
    });

    it('should require draft proposal when draft is true', async () => {
      const application = new ApplicationSubmission({
        owners: [],
        typeCode: 'COVE',
        coveHasDraft: true,
      });

      const res = await service.validateSubmission(application);
      expect(
        includesError(
          res.errors,
          new Error(`COVE proposal is missing draft proposal but has it true`),
        ),
      ).toBe(true);
    });
  });
});
``;
