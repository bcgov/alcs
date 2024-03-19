import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../../../../libs/common/src/exceptions/base.exception';
import { InquiryProfile } from '../../common/automapper/inquiry.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { Board } from '../board/board.entity';
import { Card } from '../card/card.entity';
import { CardService } from '../card/card.service';
import { InquiryParcel } from './inquiry-parcel/inquiry-parcel.entity';
import { InquiryType } from './inquiry-type.entity';
import { UpdateInquiryDto } from './inquiry.dto';
import { Inquiry } from './inquiry.entity';
import { InquiryService } from './inquiry.service';

describe('InquiryService', () => {
  let service: InquiryService;
  let mockCardService: DeepMocked<CardService>;
  let mockRepository: DeepMocked<Repository<Inquiry>>;
  let mockTypeRepository: DeepMocked<Repository<InquiryType>>;
  let mockFileNumberService: DeepMocked<FileNumberService>;

  beforeEach(async () => {
    mockCardService = createMock();
    mockRepository = createMock();
    mockTypeRepository = createMock();
    mockFileNumberService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        InquiryService,
        InquiryProfile,
        {
          provide: CardService,
          useValue: mockCardService,
        },
        {
          provide: getRepositoryToken(Inquiry),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(InquiryType),
          useValue: mockTypeRepository,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
      ],
    }).compile();

    service = module.get<InquiryService>(InquiryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load the type code and call the repo to save when creating', async () => {
    const mockCard = new Card();
    const fakeBoard = new Board();

    const payload = {
      dateSubmittedToAlc: new Date(0),
      summary: 'fake_s',
      fileNumber: 'fake_num',
      localGovernmentUuid: 'fake_gov',
      typeCode: 'fake_type',
      regionCode: 'fake_reg',
      inquirerFirstName: 'fake_first',
      inquirerLastName: 'fake_last',
      inquirerOrganization: 'fake_org',
      inquirerPhone: 'fake_phone',
      inquirerEmail: 'fake_email',
      parcels: [
        {
          civicAddress: 'fake_civic',
          pid: 'fake_pid',
          pin: 'fake_pin',
        },
      ],
    };

    mockRepository.findOne.mockResolvedValue(
      new Inquiry({
        ...payload,
        parcels: [{ ...payload.parcels[0] } as InquiryParcel],
      }),
    );
    mockRepository.save.mockResolvedValue(new Inquiry());
    mockCardService.create.mockResolvedValue(mockCard);
    mockFileNumberService.generateNextFileNumber.mockResolvedValue('fake_num');
    mockTypeRepository.findOneOrFail.mockResolvedValue(new InquiryType());

    const res = await service.create(payload, fakeBoard);

    expect(mockFileNumberService.generateNextFileNumber).toHaveBeenCalledTimes(
      1,
    );
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCardService.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].card).toBe(mockCard);
    expect(mockTypeRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ ...payload, fileNumber: 'fake_num' });
  });

  it('should call through to the repo for get by card', async () => {
    mockRepository.findOne.mockResolvedValue(new Inquiry());
    const cardUuid = 'fake-card-uuid';
    await service.getByCardUuid(cardUuid);

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when getting by card fails', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const cardUuid = 'fake-card-uuid';
    const promise = service.getByCardUuid(cardUuid);

    await expect(promise).rejects.toMatchObject(
      new Error(`Failed to find inquiry with card uuid ${cardUuid}`),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for get cards', async () => {
    mockRepository.find.mockResolvedValue([]);
    await service.getByBoard('fake');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getBy', async () => {
    const mockFilter = {
      uuid: '5',
    };
    mockRepository.find.mockResolvedValue([]);
    await service.getBy(mockFilter);

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0]!.where).toEqual(mockFilter);
  });

  it('should call throw an exception when getOrFailByUuid fails', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    const promise = service.getOrFailByUuid('uuid');

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(`Failed to find inquiry with uuid uuid`),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getByFileNumber', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(new Inquiry());
    await service.getByFileNumber('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getFileNumber', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(
      new Inquiry({
        fileNumber: 'fileNumber',
      }),
    );
    const res = await service.getFileNumber('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual('fileNumber');
  });

  it('should call through to the repo for getUuid', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(
      new Inquiry({
        uuid: 'uuid',
      }),
    );
    const res = await service.getUuid('file');

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual('uuid');
  });

  it('should set values and call save for update', async () => {
    const mockCard = new Card();
    const fakeFileNumber = 'fake_num';

    const payload: UpdateInquiryDto = {
      uuid: 'fake',
      dateSubmittedToAlc: 0,
      summary: 'fake_s',
      typeCode: 'fake_type',
      inquirerFirstName: 'fake_first',
      inquirerLastName: 'fake_last',
      inquirerOrganization: 'fake_org',
      inquirerPhone: 'fake_phone',
      inquirerEmail: 'fake_email',
    };

    const mockInquiry = new Inquiry({
      ...payload,
      dateSubmittedToAlc: new Date(0),
      fileNumber: fakeFileNumber,
      localGovernmentUuid: 'fake_gov',
      regionCode: 'fake_reg',
      parcels: [],
    });

    mockRepository.findOneOrFail.mockResolvedValue(mockInquiry);
    mockRepository.save.mockResolvedValue(new Inquiry());
    mockCardService.create.mockResolvedValue(mockCard);
    mockFileNumberService.checkValidFileNumber.mockResolvedValue(true);
    mockTypeRepository.findOneByOrFail.mockResolvedValue(new InquiryType());

    const res = await service.update('fake_num', payload);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(2);
    expect(mockTypeRepository.findOneByOrFail).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockInquiry);
  });

  it('should load deleted cards', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.getDeletedCards('file-number');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(mockRepository.find.mock.calls[0][0]!.withDeleted).toEqual(true);
  });

  it('should call through to the repo for searchByFileNumber', async () => {
    mockRepository.find.mockResolvedValue([new Inquiry()]);
    const res = await service.searchByFileNumber('file');

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
  });
});
