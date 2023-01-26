import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationParcelUpdateDto } from './application-parcel.dto';
import { ApplicationParcel } from './application-parcel.entity';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelService', () => {
  let service: ApplicationParcelService;
  let mockParcelRepo: DeepMocked<Repository<ApplicationParcel>>;

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
    applicationFileNumber: mockApplicationFileNumber,
    ownershipTypeCode: 'mock_ownershipTypeCode',
    documents: [],
  });
  const mockError = new Error('Parcel does not exist.');

  beforeEach(async () => {
    mockParcelRepo = createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationParcelService,
        {
          provide: getRepositoryToken(ApplicationParcel),
          useValue: mockParcelRepo,
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
        documents: { document: true },
        owners: {
          type: true,
        },
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
    const updateParcelDto = {
      pid: 'mock_pid',
      pin: 'mock_pin',
      legalDescription: 'mock_legalDescription',
      mapAreaHectares: 1,
      isFarm: true,
      purchasedDate: 1,
      isConfirmedByApplicant: true,
      applicationFileNumber: mockApplicationFileNumber,
      ownershipTypeCode: 'mock_ownershipTypeCode',
    } as ApplicationParcelUpdateDto;

    mockParcelRepo.findOneOrFail.mockResolvedValue(mockApplicationParcel);
    mockParcelRepo.save.mockResolvedValue({
      ...updateParcelDto,
    } as ApplicationParcel);

    const result = await service.update(mockUuid, updateParcelDto);

    expect(result).toEqual({
      ...updateParcelDto,
    } as ApplicationParcel);
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });

  it('it should fail to update a parcel if the parcel does not exist. ', async () => {
    const updateParcelDto = {
      pid: 'mock_pid',
      pin: 'mock_pin',
      legalDescription: 'mock_legalDescription',
      mapAreaHectares: 1,
      isFarm: true,
      purchasedDate: 1,
      isConfirmedByApplicant: true,
      applicationFileNumber: mockApplicationFileNumber,
      ownershipTypeCode: 'mock_ownershipTypeCode',
    } as ApplicationParcelUpdateDto;
    const mockError = new Error('Parcel does not exist.');

    mockParcelRepo.findOneOrFail.mockRejectedValue(mockError);
    mockParcelRepo.save.mockResolvedValue({} as ApplicationParcel);

    await expect(
      service.update(mockUuid, updateParcelDto),
    ).rejects.toMatchObject(mockError);
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.save).toBeCalledTimes(0);
  });

  it('should successfully delete a parcel', async () => {
    mockParcelRepo.findOneOrFail.mockResolvedValue(mockApplicationParcel);
    mockParcelRepo.remove.mockResolvedValue({} as ApplicationParcel);

    const result = await service.delete(mockUuid);

    expect(result).toEqual(mockApplicationParcel.uuid);
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.remove).toBeCalledWith([mockApplicationParcel]);
    expect(mockParcelRepo.remove).toBeCalledTimes(1);
  });

  it('should not call remove if the parcel does not exist', async () => {
    mockParcelRepo.findOneOrFail.mockRejectedValue(mockError);
    mockParcelRepo.remove.mockResolvedValue({} as ApplicationParcel);

    await expect(service.delete(mockUuid)).rejects.toMatchObject(mockError);
    expect(mockParcelRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockParcelRepo.findOneOrFail).toBeCalledWith({
      where: { uuid: mockUuid },
    });
    expect(mockParcelRepo.remove).toBeCalledTimes(0);
  });

  it('should successfully create a parcel', async () => {
    mockParcelRepo.save.mockResolvedValue({
      uuid: mockUuid,
      applicationFileNumber: mockApplicationFileNumber,
    } as ApplicationParcel);

    const mockParcel = new ApplicationParcel({
      uuid: mockUuid,
      applicationFileNumber: mockApplicationFileNumber,
    });

    const result = await service.create(mockApplicationFileNumber);

    expect(result).toEqual(mockParcel);
    expect(mockParcelRepo.save).toBeCalledTimes(1);
  });
});
