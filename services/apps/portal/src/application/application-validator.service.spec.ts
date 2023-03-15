import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import {
  LocalGovernment,
  LocalGovernmentService,
} from '../alcs/local-government/local-government.service';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from './application-document/application-document.entity';
import { ApplicationOwnerType } from './application-owner/application-owner-type/application-owner-type.entity';
import { APPLICATION_OWNER } from './application-owner/application-owner.dto';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { PARCEL_TYPE } from './application-parcel/application-parcel.dto';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationValidatorService } from './application-validator.service';
import { ApplicationProposal } from './application.entity';

function includesError(errors: Error[], target: Error) {
  return errors.some((error) => error.message === target.message);
}

describe('ApplicationValidatorService', () => {
  let service: ApplicationValidatorService;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockLGService = createMock();
    mockAppParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationValidatorService,
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
      ],
    }).compile();

    mockLGService.get.mockResolvedValue([]);
    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([]);

    service = module.get<ApplicationValidatorService>(
      ApplicationValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an error for missing applicant', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });

    const res = await service.validateApplication(application);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('should return an error for no parcels', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });

    const res = await service.validateApplication(application);

    expect(includesError(res.errors, new Error('Missing applicant'))).toBe(
      true,
    );
  });

  it('provide errors for invalid application parcel', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      documents: [],
      parcelType: PARCEL_TYPE.APPLICATION,
      ownershipTypeCode: 'SMPL',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      documents: [],
      parcelType: PARCEL_TYPE.APPLICATION,
      ownershipTypeCode: 'SMPL',
      pid: '1251251',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateApplication(application);

    expect(
      includesError(
        res.errors,
        new ServiceValidationException(`Parcel ${parcel.uuid} has invalid PID`),
      ),
    ).toBe(true);
  });

  it('should require certificate of title and crown description for CRWN parcels with PID and with CRWN owners', async () => {
    const application = new ApplicationProposal({
      owners: [
        new ApplicationOwner({
          type: new ApplicationOwnerType({
            code: APPLICATION_OWNER.CROWN,
          }),
        }),
      ],
      documents: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      documents: [],
      parcelType: PARCEL_TYPE.APPLICATION,
      ownershipTypeCode: 'CRWN',
      pid: '12512',
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });
    const parcel = new ApplicationParcel({
      uuid: 'parcel-1',
      owners: [],
      documents: [],
      parcelType: PARCEL_TYPE.OTHER,
    });

    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([parcel]);

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [mockOwner],
      documents: [],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [mockOwner, mockOwner],
      documents: [],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [mockOwner],
      documents: [],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [mockOwner, mockOwner],
      documents: [
        new ApplicationDocument({
          type: DOCUMENT_TYPE.AUTHORIZATION_LETTER,
        }),
      ],
      primaryContactOwnerUuid: mockOwner.uuid,
    });

    const res = await service.validateApplication(application);

    expect(
      includesError(
        res.errors,
        new Error(`Application has no authorization letters`),
      ),
    ).toBe(false);
  });

  it('should produce an error for missing local government', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
    });

    const res = await service.validateApplication(application);

    expect(
      includesError(
        res.errors,
        new Error('Application has no local government'),
      ),
    ).toBe(true);
  });

  it('should accept local government when its valid', async () => {
    const mockLg: LocalGovernment = {
      uuid: 'lg-uuid',
      name: 'lg',
      bceidBusinessGuid: 'CATS',
      isFirstNation: false,
    };
    mockLGService.get.mockResolvedValue([mockLg]);

    const application = new ApplicationProposal({
      owners: [],
      documents: [],
      localGovernmentUuid: mockLg.uuid,
    });

    const res = await service.validateApplication(application);

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
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
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

    const res = await service.validateApplication(application);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel Description`)),
    ).toBe(false);
    expect(
      includesError(res.errors, new Error(`Invalid Adjacent Parcels`)),
    ).toBe(false);
  });

  it('should have land use errors when not all fields are filled', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
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

    const res = await service.validateApplication(application);

    expect(
      includesError(res.errors, new Error(`Invalid Parcel Description`)),
    ).toBe(true);
    expect(
      includesError(res.errors, new Error(`Invalid Adjacent Parcels`)),
    ).toBe(true);
  });

  it('should report error for document missing type', async () => {
    const incompleteDocument = new ApplicationDocument({
      type: null,
    });
    const application = new ApplicationProposal({
      owners: [],
      documents: [incompleteDocument],
    });

    const res = await service.validateApplication(application);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing type`),
      ),
    ).toBe(true);
  });

  it('should report error for other document missing description', async () => {
    const incompleteDocument = new ApplicationDocument({
      type: DOCUMENT_TYPE.OTHER,
      description: undefined,
    });
    const application = new ApplicationProposal({
      owners: [],
      documents: [incompleteDocument],
    });

    const res = await service.validateApplication(application);

    expect(
      includesError(
        res.errors,
        new Error(`Document ${incompleteDocument.uuid} missing description`),
      ),
    ).toBe(true);
  });

  it('should report no NFU errors when all information is present and there is fill', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
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

    const res = await service.validateApplication(application);

    expect(
      includesError(res.errors, new Error(`NFU Proposal incomplete`)),
    ).toBe(false);

    expect(
      includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
    ).toBe(false);
  });

  it('should not report NFU errors when there is no fill', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
      nfuHectares: 1.5125,
      nfuPurpose: 'VALID',
      nfuOutsideLands: 'VALID',
      nfuAgricultureSupport: 'VALID',
      nfuWillImportFill: false,
    });

    const res = await service.validateApplication(application);

    expect(
      includesError(res.errors, new Error(`NFU Proposal incomplete`)),
    ).toBe(false);

    expect(
      includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
    ).toBe(false);
  });

  it('should report NFU errors when information is missing', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
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

    const res = await service.validateApplication(application);

    expect(
      includesError(res.errors, new Error(`NFU Proposal incomplete`)),
    ).toBe(true);

    expect(
      includesError(res.errors, new Error(`NFU Fill Section incomplete`)),
    ).toBe(true);
  });

  it('should report TUR errors when information is missing', async () => {
    const application = new ApplicationProposal({
      owners: [],
      documents: [],
      turAgriculturalActivities: 'turAgriculturalActivities',
      turReduceNegativeImpacts: 'turReduceNegativeImpacts',
      typeCode: 'TURP',
    });

    const res = await service.validateApplication(application);

    expect(
      includesError(res.errors, new Error(`TUR Proposal incomplete`)),
    ).toBe(true);
  });
});
