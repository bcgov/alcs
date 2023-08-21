import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../user/user.entity';
import { NoticeOfIntentOwnerService } from '../notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelUpdateDto } from './notice-of-intent-parcel.dto';
import { NoticeOfIntentParcel } from './notice-of-intent-parcel.entity';
import { NoticeOfIntentParcelService } from './notice-of-intent-parcel.service';

describe('NoticeOfIntentParcelService', () => {
  let service: NoticeOfIntentParcelService;
  let mockParcelRepo: DeepMocked<Repository<NoticeOfIntentParcel>>;
  let mockOwnerService: DeepMocked<NoticeOfIntentOwnerService>;

  const mockFileNumber = 'mock_applicationFileNumber';
  const mockUuid = 'mock_uuid';
  const mockNOIParcel = new NoticeOfIntentParcel({
    uuid: mockUuid,
    pid: 'mock_pid',
    pin: 'mock_pin',
    legalDescription: 'mock_legalDescription',
    mapAreaHectares: 1,
    isFarm: true,
    purchasedDate: new Date(1, 1, 1),
    isConfirmedByApplicant: true,
    noticeOfIntentSubmissionUuid: mockFileNumber,
    ownershipTypeCode: 'mock_ownershipTypeCode',
  });
  const mockError = new Error('Parcel does not exist.');

  beforeEach(async () => {
    mockParcelRepo = createMock();
    mockOwnerService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentParcelService,
        {
          provide: getRepositoryToken(NoticeOfIntentParcel),
          useValue: mockParcelRepo,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockOwnerService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentParcelService>(
      NoticeOfIntentParcelService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch parcels by fileNumber', async () => {
    mockParcelRepo.find.mockResolvedValue([mockNOIParcel]);

    const result = await service.fetchByFileId(mockFileNumber);

    expect(result).toEqual([mockNOIParcel]);
    expect(mockParcelRepo.find).toBeCalledTimes(1);
    expect(mockParcelRepo.find).toBeCalledWith({
      where: {
        noticeOfIntentSubmission: {
          fileNumber: mockFileNumber,
          isDraft: false,
        },
      },
      order: { auditCreatedAt: 'ASC' },
      relations: {
        certificateOfTitle: { document: true },
        owners: {
          corporateSummary: {
            document: true,
          },
          type: true,
        },
        ownershipType: true,
      },
    });
  });

  it('should get one parcel by id', async () => {
    mockParcelRepo.findOneOrFail.mockResolvedValue(mockNOIParcel);

    const result = await service.getOneOrFail(mockUuid);

    expect(result).toEqual(mockNOIParcel);
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
  });

  it('should raise error on get parcel by uuid if the parcel does not exist', async () => {
    mockParcelRepo.findOneOrFail.mockRejectedValue(mockError);

    await expect(service.getOneOrFail(mockUuid)).rejects.toMatchObject(
      mockError,
    );
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
  });

  it('should successfully update parcel', async () => {
    const updateParcelDto = [
      {
        uuid: mockUuid,
        pid: 'mock_pid',
        pin: 'mock_pin',
        legalDescription: 'mock_legalDescription',
        mapAreaHectares: 1,
        isFarm: true,
        purchasedDate: 1,
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'mock_ownershipTypeCode',
      },
    ] as NoticeOfIntentParcelUpdateDto[];

    mockParcelRepo.findOneOrFail.mockResolvedValue(mockNOIParcel);
    mockParcelRepo.save.mockResolvedValue({} as NoticeOfIntentParcel);

    await service.update(updateParcelDto, new User());

    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });

  it('should update the applicant if the parcel has owners', async () => {
    const updateParcelDto = [
      {
        uuid: mockUuid,
        pid: 'mock_pid',
        pin: 'mock_pin',
        legalDescription: 'mock_legalDescription',
        mapAreaHectares: 1,
        isFarm: true,
        purchasedDate: 1,
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'mock_ownershipTypeCode',
        ownerUuids: ['cats'],
      },
    ] as NoticeOfIntentParcelUpdateDto[];

    mockParcelRepo.findOneOrFail.mockResolvedValue(mockNOIParcel);
    mockParcelRepo.save.mockResolvedValue({} as NoticeOfIntentParcel);
    mockOwnerService.updateSubmissionApplicant.mockResolvedValue();
    mockOwnerService.getMany.mockResolvedValue([]);

    await service.update(updateParcelDto, new User());

    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(1);
    expect(mockOwnerService.updateSubmissionApplicant).toHaveBeenCalledTimes(1);
  });

  it('it should fail to update a parcel if the parcel does not exist. ', async () => {
    const updateParcelDto: NoticeOfIntentParcelUpdateDto[] = [
      {
        uuid: mockUuid,
        pid: 'mock_pid',
        pin: 'mock_pin',
        legalDescription: 'mock_legalDescription',
        mapAreaHectares: 1,
        isFarm: true,
        purchasedDate: 1,
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'mock_ownershipTypeCode',
      },
    ];
    const mockError = new Error('Parcel does not exist.');

    mockParcelRepo.findOneOrFail.mockRejectedValue(mockError);
    mockParcelRepo.save.mockResolvedValue(new NoticeOfIntentParcel());

    await expect(
      service.update(updateParcelDto, new User()),
    ).rejects.toMatchObject(mockError);
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(0);
  });

  it('should successfully delete a parcel and update applicant', async () => {
    mockParcelRepo.find.mockResolvedValue([mockNOIParcel]);
    mockParcelRepo.remove.mockResolvedValue(new NoticeOfIntentParcel());
    mockOwnerService.updateSubmissionApplicant.mockResolvedValue();

    const result = await service.deleteMany([mockUuid], new User());

    expect(result).toBeDefined();
    expect(mockParcelRepo.find).toBeCalledTimes(1);
    expect(mockParcelRepo.find).toBeCalledWith({
      where: { uuid: In([mockUuid]) },
    });
    expect(mockParcelRepo.remove).toBeCalledWith([mockNOIParcel]);
    expect(mockParcelRepo.remove).toBeCalledTimes(1);
    expect(mockOwnerService.updateSubmissionApplicant).toHaveBeenCalledTimes(1);
  });

  it('should not call remove if the parcel does not exist', async () => {
    const exception = new ServiceValidationException(
      `Unable to find parcels with provided uuids: ${mockUuid}.`,
    );

    mockParcelRepo.find.mockResolvedValue([]);
    mockParcelRepo.remove.mockResolvedValue(new NoticeOfIntentParcel());

    await expect(
      service.deleteMany([mockUuid], new User()),
    ).rejects.toMatchObject(exception);
    expect(mockParcelRepo.find).toBeCalledTimes(1);
    expect(mockParcelRepo.find).toBeCalledWith({
      where: { uuid: In([mockUuid]) },
    });
    expect(mockParcelRepo.remove).toBeCalledTimes(0);
  });

  it('should successfully create a parcel', async () => {
    mockParcelRepo.save.mockResolvedValue({
      uuid: mockUuid,
      noticeOfIntentSubmissionUuid: mockFileNumber,
    } as NoticeOfIntentParcel);

    const mockParcel = new NoticeOfIntentParcel({
      uuid: mockUuid,
      noticeOfIntentSubmissionUuid: mockFileNumber,
    });

    const result = await service.create(mockFileNumber);

    expect(result).toEqual(mockParcel);
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });
});
