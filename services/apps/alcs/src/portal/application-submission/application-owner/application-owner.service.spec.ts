import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDocument } from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { PARCEL_TYPE } from '../application-parcel/application-parcel.dto';
import { ApplicationParcel } from '../application-parcel/application-parcel.entity';
import { ApplicationParcelService } from '../application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission.service';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { ApplicationOwner } from './application-owner.entity';
import { ApplicationOwnerService } from './application-owner.service';

describe('ApplicationOwnerService', () => {
  let service: ApplicationOwnerService;
  let mockParcelService: DeepMocked<ApplicationParcelService>;
  let mockRepo: DeepMocked<Repository<ApplicationOwner>>;
  let mockTypeRepo: DeepMocked<Repository<OwnerType>>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockApplicationservice: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockParcelService = createMock();
    mockRepo = createMock();
    mockTypeRepo = createMock();
    mockAppDocumentService = createMock();
    mockApplicationservice = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationOwnerService,
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: getRepositoryToken(ApplicationOwner),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(OwnerType),
          useValue: mockTypeRepo,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationservice,
        },
      ],
    }).compile();

    service = module.get<ApplicationOwnerService>(ApplicationOwnerService);

    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new ApplicationParcel({
        owners: [new ApplicationOwner()],
      }),
    ]);
    mockApplicationservice.update.mockResolvedValue(
      new ApplicationSubmission(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find for find', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);

    await service.fetchByApplicationFileId('');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should load the type and then call save for create', async () => {
    mockRepo.save.mockResolvedValue(new ApplicationOwner());
    mockTypeRepo.findOneOrFail.mockResolvedValue(new OwnerType());

    await service.create(
      {
        applicationSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new ApplicationSubmission(),
    );

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTypeRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should load the type/parcel and then call save for attachToParcel', async () => {
    const owner = new ApplicationOwner({
      parcels: [],
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());
    mockParcelService.getOneOrFail.mockResolvedValue(new ApplicationParcel());

    await service.attachToParcel('', '');

    expect(owner.parcels.length).toEqual(1);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockParcelService.getOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should remove the parcel from the array then call save for removeFromParcel', async () => {
    const parcelUuid = '1';
    const owner = new ApplicationOwner({
      parcels: [
        new ApplicationParcel({
          uuid: parcelUuid,
        }),
      ],
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());

    await service.removeFromParcel('', parcelUuid);

    expect(owner.parcels.length).toEqual(0);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should set properties and call save for update', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());

    await service.update('', {
      firstName: 'I Am',
      lastName: 'Batman',
      email: '',
      phoneNumber: '',
      typeCode: '',
    });

    expect(owner.firstName).toEqual('I Am');
    expect(owner.lastName).toEqual('Batman');
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should delete the existing document when updating', async () => {
    const owner = new ApplicationOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
      corporateSummaryUuid: 'oldUuid',
      corporateSummary: new ApplicationDocument(),
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new ApplicationOwner());
    mockAppDocumentService.delete.mockResolvedValue({} as any);

    await service.update('', {
      organizationName: '',
      email: '',
      phoneNumber: '',
      typeCode: '',
      corporateSummaryUuid: 'newUuid',
    });

    expect(owner.corporateSummaryUuid).toEqual('newUuid');
    expect(mockAppDocumentService.delete).toHaveBeenCalledTimes(1);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should call through for delete', async () => {
    mockRepo.remove.mockResolvedValue({} as any);

    await service.delete(new ApplicationOwner());

    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });

  it('should call through for verify', async () => {
    mockRepo.findOneOrFail.mockResolvedValue(new ApplicationOwner());

    await service.getOwner('');

    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through for getMany', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);

    await service.getMany([]);

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should call through for save', async () => {
    mockRepo.save.mockResolvedValue(new ApplicationOwner());

    await service.save(new ApplicationOwner());

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should call update for the application with the first parcels last name', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);
    const owners = [
      new ApplicationOwner({
        firstName: 'B',
        lastName: 'A',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new ApplicationParcel({
        owners,
        parcelType: PARCEL_TYPE.APPLICATION,
      }),
    ]);

    await service.updateSubmissionApplicant('');

    expect(mockApplicationservice.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.update.mock.calls[0][1].applicant).toEqual(
      'A',
    );
  });

  it('should call update for the application with the first parcels last name', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);
    const owners = [
      new ApplicationOwner({
        firstName: 'F',
        lastName: 'B',
      }),
      new ApplicationOwner({
        firstName: 'F',
        lastName: 'A',
      }),
      new ApplicationOwner({
        firstName: 'F',
        lastName: '1',
      }),
      new ApplicationOwner({
        firstName: 'F',
        lastName: 'C',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new ApplicationParcel({
        owners,
        parcelType: PARCEL_TYPE.APPLICATION,
      }),
    ]);

    await service.updateSubmissionApplicant('');

    expect(mockApplicationservice.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.update.mock.calls[0][1].applicant).toEqual(
      'A et al.',
    );
  });

  it('should call update for the application with the number owners last name', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);
    const owners = [
      new ApplicationOwner({
        firstName: '1',
        lastName: '1',
      }),
      new ApplicationOwner({
        firstName: '2',
        lastName: '2',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new ApplicationParcel({
        owners,
        parcelType: PARCEL_TYPE.APPLICATION,
      }),
    ]);

    await service.updateSubmissionApplicant('');

    expect(mockApplicationservice.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.update.mock.calls[0][1].applicant).toEqual(
      '1 et al.',
    );
  });

  it('should use the first created parcel to set the application applicants name', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);
    const owners1 = [
      new ApplicationOwner({
        firstName: 'C',
        lastName: 'C',
      }),
    ];
    const owners2 = [
      new ApplicationOwner({
        firstName: 'A',
        lastName: 'A',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new ApplicationParcel({
        owners: owners1,
        auditCreatedAt: new Date(1),
        parcelType: PARCEL_TYPE.APPLICATION,
      }),
      new ApplicationParcel({
        owners: owners2,
        auditCreatedAt: new Date(100),
        parcelType: PARCEL_TYPE.APPLICATION,
      }),
    ]);

    await service.updateSubmissionApplicant('');

    expect(mockApplicationservice.update).toHaveBeenCalledTimes(1);
    expect(mockApplicationservice.update.mock.calls[0][1].applicant).toEqual(
      'A et al.',
    );
  });

  it('should load then delete non application owners', async () => {
    mockRepo.find.mockResolvedValue([new ApplicationOwner()]);
    mockRepo.remove.mockResolvedValue([] as any);

    await service.deleteNonParcelOwners('uuid');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });
});
