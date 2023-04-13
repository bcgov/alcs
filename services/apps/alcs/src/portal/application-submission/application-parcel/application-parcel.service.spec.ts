import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApplicationOwnerService } from '../application-owner/application-owner.service';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockParcelRepo: DeepMocked<Repository<ApplicationParcel>>;
  let mockOwnerService: DeepMocked<ApplicationOwnerService>;

  const mockApplicationFileNumber = 'mock_applicationFileNumber';
  const mockUuid = 'mock_uuid';
  const mockApplicationParcel = new ApplicationParcel({
    uuid: mockUuid,
    pid: 'mock_pid',
    pin: 'mock_pin',
    legalDescription: 'mock_legalDescription',
    mapAreaHectares: 1,
    isFarm: true,
    purchasedDate: new Date(1, 1, 1),
    isConfirmedByApplicant: true,
    applicationSubmissionUuid: mockApplicationFileNumber,
    ownershipTypeCode: 'mock_ownershipTypeCode',
  });
  const mockError = new Error('Parcel does not exist.');

  beforeEach(async () => {
    mockParcelRepo = createMock();
    mockOwnerService = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationParcelService,
        {
          provide: getRepositoryToken(ApplicationParcel),
          useValue: mockParcelRepo,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockOwnerService,
        },
      ],
    }).compile();

    service = module.get<ApplicationParcelService>(ApplicationParcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch parcels by fileNumber', async () => {
    mockParcelRepo.find.mockResolvedValue([mockApplicationParcel]);

    const result = await service.fetchByApplicationFileId(
      mockApplicationFileNumber,
    );

    expect(result).toEqual([mockApplicationParcel]);
    expect(mockParcelRepo.find).toBeCalledTimes(1);
    expect(mockParcelRepo.find).toBeCalledWith({
      where: { application: { fileNumber: mockApplicationFileNumber } },
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
    mockParcelRepo.findOneOrFail.mockResolvedValue(mockApplicationParcel);

    const result = await service.getOneOrFail(mockUuid);

    expect(result).toEqual(mockApplicationParcel);
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
    ] as ApplicationParcelUpdateDto[];

    mockParcelRepo.findOneOrFail.mockResolvedValue(mockApplicationParcel);
    mockParcelRepo.save.mockResolvedValue({} as ApplicationParcel);

    await service.update(updateParcelDto);

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
    ] as ApplicationParcelUpdateDto[];

    mockParcelRepo.findOneOrFail.mockResolvedValue(mockApplicationParcel);
    mockParcelRepo.save.mockResolvedValue({} as ApplicationParcel);
    mockOwnerService.updateSubmissionApplicant.mockResolvedValue();
    mockOwnerService.getMany.mockResolvedValue([]);

    await service.update(updateParcelDto);

    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(1);
    expect(mockOwnerService.updateSubmissionApplicant).toHaveBeenCalledTimes(1);
  });

  it('it should fail to update a parcel if the parcel does not exist. ', async () => {
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
    ] as ApplicationParcelUpdateDto[];
    const mockError = new Error('Parcel does not exist.');

    mockParcelRepo.findOneOrFail.mockRejectedValue(mockError);
    mockParcelRepo.save.mockResolvedValue({} as ApplicationParcel);

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
    mockParcelRepo.find.mockResolvedValue([mockApplicationParcel]);
    mockParcelRepo.remove.mockResolvedValue({} as ApplicationParcel);
    mockOwnerService.updateSubmissionApplicant.mockResolvedValue();

    const result = await service.deleteMany([mockUuid]);

    expect(result).toBeDefined();
    expect(mockParcelRepo.find).toBeCalledTimes(1);
    expect(mockParcelRepo.find).toBeCalledWith({
      where: { uuid: In([mockUuid]) },
    });
    expect(mockParcelRepo.remove).toBeCalledWith([mockApplicationParcel]);
    expect(mockParcelRepo.remove).toBeCalledTimes(1);
    expect(mockOwnerService.updateSubmissionApplicant).toHaveBeenCalledTimes(1);
  });

  it('should not call remove if the parcel does not exist', async () => {
    const exception = new ServiceValidationException(
      `Unable to find parcels with provided uuids: ${mockUuid}.`,
    );

    mockParcelRepo.find.mockResolvedValue([]);
    mockParcelRepo.remove.mockResolvedValue({} as ApplicationParcel);

    await expect(service.deleteMany([mockUuid])).rejects.toMatchObject(
      exception,
    );
    expect(mockParcelRepo.find).toBeCalledTimes(1);
    expect(mockParcelRepo.find).toBeCalledWith({
      where: { uuid: In([mockUuid]) },
    });
    expect(mockParcelRepo.remove).toBeCalledTimes(0);
  });

  it('should successfully create a parcel', async () => {
    mockParcelRepo.save.mockResolvedValue({
      uuid: mockUuid,
      applicationSubmissionUuid: mockApplicationFileNumber,
    } as ApplicationParcel);

    const mockParcel = new ApplicationParcel({
      uuid: mockUuid,
      applicationSubmissionUuid: mockApplicationFileNumber,
    });

    const result = await service.create(mockApplicationFileNumber);

    expect(result).toEqual(mockParcel);
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });
});
