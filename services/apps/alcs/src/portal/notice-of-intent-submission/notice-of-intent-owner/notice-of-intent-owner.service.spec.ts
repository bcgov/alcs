import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentDocument } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';
import { NoticeOfIntentDocumentService } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentService } from '../../../alcs/notice-of-intent/notice-of-intent.service';
import { OwnerType } from '../../../common/owner-type/owner-type.entity';
import { User } from '../../../user/user.entity';
import { NoticeOfIntentParcel } from '../notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from '../notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from '../notice-of-intent-submission.service';
import { NoticeOfIntentOwner } from './notice-of-intent-owner.entity';
import { NoticeOfIntentOwnerService } from './notice-of-intent-owner.service';

describe('NoticeOfIntentOwnerService', () => {
  let service: NoticeOfIntentOwnerService;
  let mockParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockRepo: DeepMocked<Repository<NoticeOfIntentOwner>>;
  let mockTypeRepo: DeepMocked<Repository<OwnerType>>;
  let mockAppDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;

  beforeEach(async () => {
    mockParcelService = createMock();
    mockRepo = createMock();
    mockTypeRepo = createMock();
    mockAppDocumentService = createMock();
    mockNoiSubmissionService = createMock();
    mockNoiService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentOwnerService,
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockParcelService,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentOwner),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(OwnerType),
          useValue: mockTypeRepo,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoiService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentOwnerService>(
      NoticeOfIntentOwnerService,
    );

    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new NoticeOfIntentParcel({
        owners: [new NoticeOfIntentOwner()],
      }),
    ]);
    mockNoiSubmissionService.update.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
    mockNoiService.updateApplicant.mockResolvedValue();
    mockNoiSubmissionService.getFileNumber.mockResolvedValue('file-number');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find for find', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);

    await service.fetchByApplicationFileId('');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should load the type and then call save for create', async () => {
    mockRepo.save.mockResolvedValue(new NoticeOfIntentOwner());
    mockTypeRepo.findOneOrFail.mockResolvedValue(new OwnerType());

    await service.create(
      {
        noticeOfIntentSubmissionUuid: '',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new NoticeOfIntentSubmission(),
    );

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTypeRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should load the type/parcel and then call save for attachToParcel', async () => {
    const owner = new NoticeOfIntentOwner({
      parcels: [],
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new NoticeOfIntentOwner());
    mockParcelService.getOneOrFail.mockResolvedValue(
      new NoticeOfIntentParcel(),
    );

    await service.attachToParcel('', '', new User());

    expect(owner.parcels.length).toEqual(1);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockParcelService.getOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should remove the parcel from the array then call save for removeFromParcel', async () => {
    const parcelUuid = '1';
    const owner = new NoticeOfIntentOwner({
      parcels: [
        new NoticeOfIntentParcel({
          uuid: parcelUuid,
        }),
      ],
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new NoticeOfIntentOwner());

    await service.removeFromParcel('', parcelUuid, new User());

    expect(owner.parcels.length).toEqual(0);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should set properties and call save for update', async () => {
    const owner = new NoticeOfIntentOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new NoticeOfIntentOwner());

    await service.update(
      '',
      {
        firstName: 'I Am',
        lastName: 'Batman',
        email: '',
        phoneNumber: '',
        typeCode: '',
      },
      new User(),
    );

    expect(owner.firstName).toEqual('I Am');
    expect(owner.lastName).toEqual('Batman');
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should delete the existing document when updating', async () => {
    const owner = new NoticeOfIntentOwner({
      firstName: 'Bruce',
      lastName: 'Wayne',
      corporateSummaryUuid: 'oldUuid',
      corporateSummary: new NoticeOfIntentDocument(),
    });
    mockRepo.findOneOrFail.mockResolvedValue(owner);
    mockRepo.save.mockResolvedValue(new NoticeOfIntentOwner());
    mockAppDocumentService.delete.mockResolvedValue({} as any);

    await service.update(
      '',
      {
        organizationName: '',
        email: '',
        phoneNumber: '',
        typeCode: '',
        corporateSummaryUuid: 'newUuid',
      },
      new User(),
    );

    expect(owner.corporateSummaryUuid).toEqual('newUuid');
    expect(mockAppDocumentService.delete).toHaveBeenCalledTimes(1);
    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should call through for delete', async () => {
    mockRepo.remove.mockResolvedValue({} as any);

    await service.delete(new NoticeOfIntentOwner(), new User());

    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });

  it('should call through for verify', async () => {
    mockRepo.findOneOrFail.mockResolvedValue(new NoticeOfIntentOwner());

    await service.getOwner('');

    expect(mockRepo.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through for getMany', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);

    await service.getMany([]);

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should call through for save', async () => {
    mockRepo.save.mockResolvedValue(new NoticeOfIntentOwner());

    await service.save(new NoticeOfIntentOwner());

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should call update with the first parcels last name', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);
    const owners = [
      new NoticeOfIntentOwner({
        firstName: 'B',
        lastName: 'A',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new NoticeOfIntentParcel({
        owners,
      }),
    ]);

    await service.updateSubmissionApplicant('', new User());

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      'A',
    );
    expect(mockNoiSubmissionService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNoiService.updateApplicant).toHaveBeenCalledTimes(1);
  });

  it('should call update with the first parcels last name', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);
    const owners = [
      new NoticeOfIntentOwner({
        firstName: 'F',
        lastName: 'B',
      }),
      new NoticeOfIntentOwner({
        firstName: 'F',
        lastName: 'A',
      }),
      new NoticeOfIntentOwner({
        firstName: 'F',
        lastName: '1',
      }),
      new NoticeOfIntentOwner({
        firstName: 'F',
        lastName: 'C',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new NoticeOfIntentParcel({
        owners,
      }),
    ]);

    await service.updateSubmissionApplicant('', new User());

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      'A et al.',
    );
    expect(mockNoiSubmissionService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNoiService.updateApplicant).toHaveBeenCalledTimes(1);
  });

  it('should call update with the number owners last name', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);
    const owners = [
      new NoticeOfIntentOwner({
        firstName: '1',
        lastName: '1',
      }),
      new NoticeOfIntentOwner({
        firstName: '2',
        lastName: '2',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new NoticeOfIntentParcel({
        owners,
      }),
    ]);

    await service.updateSubmissionApplicant('', new User());

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      '1 et al.',
    );
  });

  it('should use the first created parcel to set the applicants name', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);
    const owners1 = [
      new NoticeOfIntentOwner({
        firstName: 'C',
        lastName: 'C',
      }),
    ];
    const owners2 = [
      new NoticeOfIntentOwner({
        firstName: 'A',
        lastName: 'A',
      }),
    ];
    mockParcelService.fetchByApplicationSubmissionUuid.mockResolvedValue([
      new NoticeOfIntentParcel({
        owners: owners1,
        auditCreatedAt: new Date(1),
      }),
      new NoticeOfIntentParcel({
        owners: owners2,
        auditCreatedAt: new Date(100),
      }),
    ]);

    await service.updateSubmissionApplicant('', new User());

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.update.mock.calls[0][1].applicant).toEqual(
      'A et al.',
    );
    expect(mockNoiSubmissionService.getFileNumber).toHaveBeenCalledTimes(1);
    expect(mockNoiService.updateApplicant).toHaveBeenCalledTimes(1);
  });

  it('should load then delete non application owners', async () => {
    mockRepo.find.mockResolvedValue([new NoticeOfIntentOwner()]);
    mockRepo.remove.mockResolvedValue([] as any);

    await service.deleteNonParcelOwners('uuid');

    expect(mockRepo.find).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });
});
