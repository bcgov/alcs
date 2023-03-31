import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import {
  ApplicationDocumentCode,
  DOCUMENT_TYPE,
} from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { ApplicationOwnerType } from './application-owner/application-owner-type/application-owner-type.entity';
import { APPLICATION_OWNER } from './application-owner/application-owner.dto';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { PARCEL_TYPE } from './application-parcel/application-parcel.dto';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationSubmissionValidatorService } from './application-submission-validator.service';
import { ApplicationSubmission } from './application-submission.entity';
import { Document } from '../../document/document.entity';

function includesError(errors: Error[], target: Error) {
  return errors.some((error) => error.message === target.message);
}

describe('ApplicationSubmissionValidatorService', () => {
  let service: ApplicationSubmissionValidatorService;
  let mockLGService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockLGService = createMock();
    mockAppParcelService = createMock();
    mockAppDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionValidatorService,
        {
          provide: ApplicationLocalGovernmentService,
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
      parcelType: PARCEL_TYPE.APPLICATION,
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
      parcelType: PARCEL_TYPE.APPLICATION,
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
          type: new ApplicationOwnerType({
            code: APPLICATION_OWNER.CROWN,
          }),
        }),
      ],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      parcelType: PARCEL_TYPE.APPLICATION,
      ownershipTypeCode: 'CRWN',
      pid: '12512',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(
        res.errors,
        new Error(`Crown Parcel ${parcel.uuid} has no ownership type`),
      ),
    ).toBe(true);
    expect(
      includesError(
        res.errors,
        new Error(`Parcel is missing certificate of title ${parcel.uuid}`),
      ),
    ).toBe(true);
  });

  it('should not require certificate of title for other parcels', async () => {
    const applicationSubmission = new ApplicationSubmission({
      owners: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      parcelType: PARCEL_TYPE.OTHER,
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateSubmission(applicationSubmission);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel ${parcel.uuid}`)),
    ).toBe(false);
    expect(
      includesError(
        res.errors,
        new Error(`Parcel has no Owners ${parcel.uuid}`),
      ),
    ).toBe(true);
    expect(
      includesError(
        res.errors,
        new Error(`Parcel is missing certificate of title ${parcel.uuid}`),
      ),
    ).toBe(false);
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
      type: new ApplicationOwnerType({
        code: APPLICATION_OWNER.AGENT,
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
      type: new ApplicationOwnerType({
        code: APPLICATION_OWNER.AGENT,
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
      type: new ApplicationOwnerType({
        code: APPLICATION_OWNER.INDIVIDUAL,
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
        new Error(`Application has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should not have an authorization letter error when one is provided', async () => {
    const mockOwner = new ApplicationOwner({
      uuid: 'owner-uuid',
      type: new ApplicationOwnerType({
        code: APPLICATION_OWNER.INDIVIDUAL,
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
        type: new ApplicationDocumentCode({
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
    const mockLg = new ApplicationLocalGovernment({
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
      type: new ApplicationDocumentCode({
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

  it('should report no NFU errors when all information is present and there is fill', async () => {
    const application = new ApplicationSubmission({
      owners: [],
      nfuHectares: 1.5125,
      nfuPurpose: 'VALID',
      nfuOutsideLands: 'VALID',
      nfuAgricultureSupport: 'VALID',
      nfuWillImportFill: true,
      nfuFillTypeDescription: 'VALID',
      nfuFillOriginDescription: 'VALID',
      nfuTotalFillPlacement: 0.0,
      nfuMaxFillDepth: 1.5125,
      nfuFillVolume: 742.1,
      nfuProjectDurationAmount: 12,
      nfuProjectDurationUnit: 'VALID',
    });

    const res = await service.validateSubmission(application);

    expect(
      includesError(res.errors, new Error(`NFU Proposal incomplete`)),
    ).toBe(false);

    expect(
      includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
    ).toBe(false);
  });

  it('should not report NFU errors when there is no fill', async () => {
    const application = new ApplicationSubmission({
      owners: [],
      nfuHectares: 1.5125,
      nfuPurpose: 'VALID',
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

  it('should report NFU errors when information is missing', async () => {
    const application = new ApplicationSubmission({
      owners: [],
      nfuHectares: null,
      nfuPurpose: 'VALID',
      nfuOutsideLands: 'VALID',
      nfuAgricultureSupport: 'VALID',
      nfuWillImportFill: true,
      nfuFillTypeDescription: 'VALID',
      nfuFillOriginDescription: null,
      nfuTotalFillPlacement: 0.0,
      nfuMaxFillDepth: 1.5125,
      nfuFillVolume: 742.1,
      nfuProjectDurationAmount: 12,
      nfuProjectDurationUnit: 'VALID',
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

  it('should report TUR errors when information is missing', async () => {
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
