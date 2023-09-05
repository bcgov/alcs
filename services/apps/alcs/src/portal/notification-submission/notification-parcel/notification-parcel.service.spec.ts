import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../user/user.entity';
import { NotificationTransfereeService } from '../notification-transferee/notification-transferee.service';
import { NotificationParcelUpdateDto } from './notification-parcel.dto';
import { NotificationParcel } from './notification-parcel.entity';
import { NotificationParcelService } from './notification-parcel.service';

describe('NotificationParcelService', () => {
  let service: NotificationParcelService;
  let mockParcelRepo: DeepMocked<Repository<NotificationParcel>>;
  let mockOwnerService: DeepMocked<NotificationTransfereeService>;

  const mockFileNumber = 'mock_applicationFileNumber';
  const mockUuid = 'mock_uuid';
  const mockNOIParcel = new NotificationParcel({
    uuid: mockUuid,
    pid: 'mock_pid',
    pin: 'mock_pin',
    legalDescription: 'mock_legalDescription',
    mapAreaHectares: 1,
    notificationSubmissionUuid: mockFileNumber,
    ownershipTypeCode: 'mock_ownershipTypeCode',
  });
  const mockError = new Error('Parcel does not exist.');

  beforeEach(async () => {
    mockParcelRepo = createMock();
    mockOwnerService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationParcelService,
        {
          provide: getRepositoryToken(NotificationParcel),
          useValue: mockParcelRepo,
        },
        {
          provide: NotificationTransfereeService,
          useValue: mockOwnerService,
        },
      ],
    }).compile();

    service = module.get<NotificationParcelService>(NotificationParcelService);
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
        notificationSubmission: {
          fileNumber: mockFileNumber,
        },
      },
      order: { auditCreatedAt: 'ASC' },
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
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'mock_ownershipTypeCode',
      },
    ] as NotificationParcelUpdateDto[];

    mockParcelRepo.findOneOrFail.mockResolvedValue(mockNOIParcel);
    mockParcelRepo.save.mockResolvedValue({} as NotificationParcel);

    await service.update(updateParcelDto);

    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });

  it('it should fail to update a parcel if the parcel does not exist. ', async () => {
    const updateParcelDto: NotificationParcelUpdateDto[] = [
      {
        uuid: mockUuid,
        pid: 'mock_pid',
        pin: 'mock_pin',
        legalDescription: 'mock_legalDescription',
        mapAreaHectares: 1,
        isConfirmedByApplicant: true,
        ownershipTypeCode: 'mock_ownershipTypeCode',
      },
    ];
    const mockError = new Error('Parcel does not exist.');

    mockParcelRepo.findOneOrFail.mockRejectedValue(mockError);
    mockParcelRepo.save.mockResolvedValue(new NotificationParcel());

    await expect(service.update(updateParcelDto)).rejects.toMatchObject(
      mockError,
    );
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(0);
  });

  it('should successfully delete a parcel and update applicant', async () => {
    mockParcelRepo.find.mockResolvedValue([mockNOIParcel]);
    mockParcelRepo.remove.mockResolvedValue(new NotificationParcel());
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
    mockParcelRepo.remove.mockResolvedValue(new NotificationParcel());

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
      notificationSubmissionUuid: mockFileNumber,
    } as NotificationParcel);

    const mockParcel = new NotificationParcel({
      uuid: mockUuid,
      notificationSubmissionUuid: mockFileNumber,
    });

    const result = await service.create(mockFileNumber);

    expect(result).toEqual(mockParcel);
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });
});
