import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import {
  OwnerType,
  OWNER_TYPE,
} from '../../common/owner-type/owner-type.entity';
import {
  DocumentCode,
  DOCUMENT_TYPE,
} from '../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { NoticeOfIntentOwner } from './notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from './notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionValidatorService } from './notice-of-intent-submission-validator.service';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';

function includesError(errors: Error[], target: Error) {
  return errors.some((error) => error.message === target.message);
}

describe('NoticeOfIntentSubmissionValidatorService', () => {
  let service: NoticeOfIntentSubmissionValidatorService;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNoiDocumentService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    mockLGService = createMock();
    mockNoiParcelService = createMock();
    mockNoiDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentSubmissionValidatorService,
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
    }).compile();

    mockLGService.list.mockResolvedValue([]);
    mockNoiParcelService.fetchByFileId.mockResolvedValue([]);
    mockNoiDocumentService.getApplicantDocuments.mockResolvedValue([]);

    service = module.get<NoticeOfIntentSubmissionValidatorService>(
      NoticeOfIntentSubmissionValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an error for missing applicant', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('should return an error for missing purpose', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(includesError(res.errors, new Error('Missing purpose'))).toBe(true);
  });

  it('should return an error for no parcels', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('provide errors for invalid parcel', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });
    const parcel = new NoticeOfIntentParcel({
      uuid: 'parcel-1',
      owners: [],
      ownershipTypeCode: 'SMPL',
    });

    mockNoiParcelService.fetchByFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

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
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });
    const parcel = new NoticeOfIntentParcel({
      uuid: 'parcel-1',
      owners: [],
      ownershipTypeCode: 'SMPL',
      pid: '1251251',
    });

    mockNoiParcelService.fetchByFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Parcel ${parcel.uuid} has invalid PID`),
      ),
    ).toBe(true);
  });

  it('should require certificate of title and crown description for CRWN parcels with PID and with CRWN owners', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [
        new NoticeOfIntentOwner({
          type: new OwnerType({
            code: OWNER_TYPE.CROWN,
          }),
        }),
      ],
      soilProposedStructures: [],
    });
    const parcel = new NoticeOfIntentParcel({
      uuid: 'parcel-1',
      owners: [],
      ownershipTypeCode: 'CRWN',
      pid: '12512',
    });

    mockNoiParcelService.fetchByFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Parcel is missing certificate of title ${parcel.uuid}`),
      ),
    ).toBe(true);
  });

  it('should return an error for no primary contact', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Notice of Intent has no primary contact`),
      ),
    ).toBe(true);
  });

  it('should return errors for an invalid third party agent', async () => {
    const mockOwner = new NoticeOfIntentOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.AGENT,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Invalid Third Party Agent Information`),
      ),
    ).toBe(true);
  });

  it('should require an authorization letter for more than one owner', async () => {
    const mockOwner = new NoticeOfIntentOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.AGENT,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [mockOwner, mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Notice of Intent has no authorization letters`),
      ),
    ).toBe(true);
  });

  it('should not require an authorization letter for a single owner', async () => {
    const mockOwner = new NoticeOfIntentOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.INDIVIDUAL,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Notice of Intent has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should not require an authorization letter when contact is government', async () => {
    const mockOwner = new NoticeOfIntentOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.INDIVIDUAL,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });

    const governmentOwner = new NoticeOfIntentOwner({
      uuid: 'government-owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.GOVERNMENT,
      }),
      firstName: 'Govern',
      lastName: 'Ment',
    });

    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [mockOwner, governmentOwner],
      primaryContactOwnerUuid: governmentOwner.uuid,
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Notice of Intent has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should not have an authorization letter error when one is provided', async () => {
    const mockOwner = new NoticeOfIntentOwner({
      uuid: 'owner-uuid',
      type: new OwnerType({
        code: OWNER_TYPE.INDIVIDUAL,
      }),
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [mockOwner, mockOwner],
      primaryContactOwnerUuid: mockOwner.uuid,
      soilProposedStructures: [],
    });

    const documents = [
      new NoticeOfIntentDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.AUTHORIZATION_LETTER,
        }),
      }),
    ];
    mockNoiDocumentService.getApplicantDocuments.mockResolvedValue(documents);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Notice of Intent has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should produce an error for missing local government', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error('Notice of Intent has no local government'),
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

    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      localGovernmentUuid: mockLg.uuid,
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

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
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
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

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel Description`)),
    ).toBe(false);
    expect(
      includesError(res.errors, new Error(`Invalid Adjacent Parcels`)),
    ).toBe(false);
  });

  it('should have land use errors when not all fields are filled', async () => {
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
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

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel Description`)),
    ).toBe(true);
    expect(
      includesError(res.errors, new Error(`Invalid Adjacent Parcels`)),
    ).toBe(true);
  });

  it('should report error for document missing type', async () => {
    const incompleteDocument = new NoticeOfIntentDocument({
      type: undefined,
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
    });

    const documents = [incompleteDocument];
    mockNoiDocumentService.getApplicantDocuments.mockResolvedValue(documents);

    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing type`),
      ),
    ).toBe(true);
  });

  it('should report error for other document missing description', async () => {
    const incompleteDocument = new NoticeOfIntentDocument({
      type: new DocumentCode({
        code: DOCUMENT_TYPE.OTHER,
      }),
      document: new Document({
        source: DOCUMENT_SOURCE.APPLICANT,
      }),
      description: undefined,
    });
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      owners: [],
      soilProposedStructures: [],
    });

    const documents = [incompleteDocument];
    mockNoiDocumentService.getApplicantDocuments.mockResolvedValue(documents);

    const res = await service.validateSubmission(noticeOfIntentSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing description`),
      ),
    ).toBe(true);
  });

  describe('Additional Info', () => {
    it('should be happy with complete structures', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilIsRemovingSoilForNewStructure: true,
        soilProposedStructures: [
          { type: 'Residential - Accessory Structure', area: 5 },
          { type: 'Farm Structure', area: 5 },
          { type: 'Residential - Additional Residence', area: 5 },
        ],
        soilStructureFarmUseReason: 'VALID',
        soilAgriParcelActivity: 'VALID',
        soilStructureResidentialAccessoryUseReason: 'VALID',
        typeCode: 'ROSO',
      });

      const buildingPlan = new NoticeOfIntentDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.BUILDING_PLAN,
        }),
        typeCode: DOCUMENT_TYPE.BUILDING_PLAN,
      });

      const documents = [buildingPlan];
      mockNoiDocumentService.getApplicantDocuments.mockResolvedValue(documents);

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing structures`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal incomplete structure`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Building Plans`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing farm use reason`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing agricultural activity`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing accessory use reason`),
        ),
      ).toBe(false);
    });

    it('should be happy with no structures', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilIsRemovingSoilForNewStructure: false,
        soilProposedStructures: [],
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing structures`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal incomplete structure`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Building Plans`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing farm use reason`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing agricultural activity`),
        ),
      ).toBe(false);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing accessory use reason`),
        ),
      ).toBe(false);
    });

    it('should require structures', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilIsRemovingSoilForNewStructure: true,
        soilProposedStructures: [],
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing structures`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Building Plans`),
        ),
      ).toBe(true);
    });

    it('should require additional questions when having all structures', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilIsRemovingSoilForNewStructure: true,
        soilProposedStructures: [
          { type: 'Residential - Accessory Structure', area: 5 },
          { type: 'Farm Structure', area: 5 },
          { type: 'Residential - Additional Residence', area: null },
        ],
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal incomplete structure`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing farm use reason`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing agricultural activity`),
        ),
      ).toBe(true);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing residential use reason`),
        ),
      ).toBe(true);
    });
  });

  describe('ROSO Notice of Intents', () => {
    it('should not have an error when base information is filled correctly', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilProposedStructures: [],
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

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(res.errors, new Error(`ROSO proposal incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilProposedStructures: [],
        soilTypeRemoved: null,
        soilToRemoveVolume: null,
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(res.errors, new Error(`ROSO proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`ROSO Soil Table Incomplete`)),
      ).toBe(true);
    });

    it('should require NOIDs or ApplicationIDs', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilProposedStructures: [],
        soilIsFollowUp: true,
        soilFollowUpIDs: null,
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(
          res.errors,
          new Error(`ROSO proposal missing Application or NOI IDs`),
        ),
      ).toBe(true);
    });

    it('should complain about missing files when soilIsExtractionOrMining is true', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilProposedStructures: [],
        soilIsFollowUp: true,
        soilIsExtractionOrMining: true,
        typeCode: 'ROSO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

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

  describe('POFO Notice of Intents', () => {
    it('should not have errors when base information is filled correctly', async () => {
      const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
        owners: [],
        soilProposedStructures: [],
        soilIsFollowUp: false,
        soilAlreadyPlacedVolume: 5,
        soilAlreadyPlacedMaximumDepth: 5,
        soilToPlaceMaximumDepth: 5,
        soilAlreadyPlacedAverageDepth: 5,
        soilAlreadyPlacedArea: 5,
        soilToPlaceAverageDepth: 5,
        soilToPlaceVolume: 5,
        soilToPlaceArea: 5,
        soilFillTypeToPlace: 'soilFillTypeToPlace',
        typeCode: 'POFO',
      });

      const res = await service.validateSubmission(noticeOfIntentSubmission);

      expect(
        includesError(res.errors, new Error(`POFO Proposal incomplete`)),
      ).toBe(false);

      expect(
        includesError(res.errors, new Error(`POFO Soil Table Incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilIsFollowUp: true,
        soilFillTypeToPlace: null,
        soilToPlaceArea: null,
        typeCode: 'POFO',
        soilProposedStructures: [],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`POFO proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`POFO Soil Table Incomplete`)),
      ).toBe(true);
    });

    it('should require NOI IDs or ApplicationIDs', async () => {
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'POFO',
        soilProposedStructures: [],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`POFO proposal missing Application or NOI IDs`),
        ),
      ).toBe(true);
    });

    it('should complain about missing files', async () => {
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'POFO',
        soilProposedStructures: [],
        soilIsExtractionOrMining: true,
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
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilProposedStructures: [],
        purpose: 'purpose',
        soilIsFollowUp: false,
        soilAlreadyPlacedVolume: 5,
        soilAlreadyPlacedMaximumDepth: 5,
        soilToPlaceMaximumDepth: 5,
        soilAlreadyPlacedAverageDepth: 5,
        soilAlreadyPlacedArea: 5,
        soilToPlaceAverageDepth: 5,
        soilToPlaceVolume: 5,
        soilToPlaceArea: 5,
        soilFillTypeToPlace: 'soilFillTypeToPlace',
        typeCode: 'PFRS',
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`PFRS proposal incomplete`)),
      ).toBe(false);

      expect(
        includesError(res.errors, new Error(`PFRS Soil Table Incomplete`)),
      ).toBe(false);
    });

    it('should report errors when information is missing', async () => {
      const application = new NoticeOfIntentSubmission({
        owners: [],
        purpose: 'purpose',
        soilFillTypeToPlace: null,
        soilToPlaceArea: null,
        typeCode: 'PFRS',
        soilProposedStructures: [],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(res.errors, new Error(`PFRS proposal incomplete`)),
      ).toBe(true);

      expect(
        includesError(res.errors, new Error(`PFRS Soil Table Incomplete`)),
      ).toBe(true);
    });

    it('should require NOI IDs or ApplicationIDs', async () => {
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'PFRS',
        soilProposedStructures: [],
      });

      const res = await service.validateSubmission(application);

      expect(
        includesError(
          res.errors,
          new Error(`PFRS proposal missing Application or NOI IDs`),
        ),
      ).toBe(true);
    });

    it('should complain about missing files', async () => {
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilIsFollowUp: true,
        typeCode: 'PFRS',
        soilProposedStructures: [],
        soilIsExtractionOrMining: true,
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
      const application = new NoticeOfIntentSubmission({
        owners: [],
        soilIsFollowUp: true,
        soilIsExtractionOrMining: true,
        soilHasSubmittedNotice: true,
        typeCode: 'PFRS',
        soilProposedStructures: [],
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
});
