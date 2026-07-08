import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import * as config from 'config';
import { Repository } from 'typeorm';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { UserService } from '../../../../user/user.service';
import { ComplianceAndEnforcement } from '../../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from '../../compliance-and-enforcement.service';
import { ComplianceAndEnforcementResponsiblePartyService } from '../../responsible-parties/responsible-parties.service';
import { ComplianceAndEnforcementResponsibleParty } from '../../responsible-parties/responsible-party.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { ComplianceAndEnforcementChronologyService } from '../chronology.service';
import { ComplianceAndEnforcementOrderProfile } from './order.automapper.profile';
import { ComplianceAndEnforcementOrder } from './order.entity';
import { ComplianceAndEnforcementOrderService } from './order.service';

describe('ComplianceAndEnforcementChronologyOrderService', () => {
  let service: ComplianceAndEnforcementOrderService;
  let mockRepository: DeepMocked<Repository<ComplianceAndEnforcementOrder>>;

  let mockChronologyService: DeepMocked<ComplianceAndEnforcementChronologyService>;
  let mockChronologyRepository: DeepMocked<Repository<ComplianceAndEnforcementChronologyEntry>>;

  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockComplianceAndEnforcementRepository: DeepMocked<Repository<ComplianceAndEnforcement>>;

  let mockPartiesService: DeepMocked<ComplianceAndEnforcementResponsiblePartyService>;
  let mockPartiesRepository: DeepMocked<Repository<ComplianceAndEnforcementResponsibleParty>>;

  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockRepository = createMock<Repository<ComplianceAndEnforcementOrder>>();

    mockChronologyService = createMock<ComplianceAndEnforcementChronologyService>();
    mockChronologyRepository = createMock<Repository<ComplianceAndEnforcementChronologyEntry>>();

    mockComplianceAndEnforcementService = createMock<ComplianceAndEnforcementService>();
    mockComplianceAndEnforcementRepository = createMock<Repository<ComplianceAndEnforcement>>();

    mockPartiesService = createMock<ComplianceAndEnforcementResponsiblePartyService>();
    mockPartiesRepository = createMock<Repository<ComplianceAndEnforcementResponsibleParty>>();

    mockUserService = createMock<UserService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ComplianceAndEnforcementOrderService,
        ComplianceAndEnforcementOrderProfile,
        {
          provide: getRepositoryToken(ComplianceAndEnforcementOrder),
          useValue: mockRepository,
        },
        {
          provide: ComplianceAndEnforcementChronologyService,
          useValue: mockChronologyService,
        },
        {
          provide: getRepositoryToken(ComplianceAndEnforcementChronologyEntry),
          useValue: mockChronologyRepository,
        },
        {
          provide: ComplianceAndEnforcementService,
          useValue: mockComplianceAndEnforcementService,
        },
        {
          provide: getRepositoryToken(ComplianceAndEnforcement),
          useValue: mockComplianceAndEnforcementRepository,
        },
        {
          provide: ComplianceAndEnforcementResponsiblePartyService,
          useValue: mockPartiesService,
        },
        {
          provide: getRepositoryToken(ComplianceAndEnforcementResponsibleParty),
          useValue: mockPartiesRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<ComplianceAndEnforcementOrderService>(ComplianceAndEnforcementOrderService);
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(0));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getAll and return mapped orders', async () => {
    const entity = new ComplianceAndEnforcementOrder({
      uuid: 'i-1',
      createdAt: new Date(),
      isDraft: false,
    });
    mockRepository.find.mockResolvedValue([entity] as any);

    const result = await service.getAll();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].uuid).toBe('i-1');
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should pass filterByEntryUuid to repository.find', async () => {
    mockRepository.find.mockResolvedValue([] as any);

    await service.getAll({ filterByEntryUuid: 'entry-1' });

    expect(mockRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entry: expect.objectContaining({ uuid: 'entry-1' }),
        }),
      }),
    );
  });

  it('should create draft and return uuid', async () => {
    mockRepository.create.mockReturnValue({} as any);
    mockRepository.save.mockResolvedValue({ uuid: 'draft-1' } as any);

    const uuid = await service.createDraft({ officerUuid: 'o-1', entryUuid: 'e-1' } as any);

    expect(uuid).toBe('draft-1');
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should update existing order', async () => {
    mockRepository.findOneBy.mockResolvedValue(new ComplianceAndEnforcementOrder({ uuid: 'u-1' }) as any);
    mockRepository.save.mockResolvedValue(new ComplianceAndEnforcementOrder({ uuid: 'u-1' }) as any);

    const result = await service.update('u-1', {} as any);

    expect(result).toBeDefined();
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ uuid: 'u-1' });
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw ServiceConflictException when updating missing order', async () => {
    mockRepository.findOneBy.mockResolvedValue(null as any);

    await expect(service.update('missing', {} as any)).rejects.toBeInstanceOf(ServiceConflictException);
  });

  it('should delete existing order', async () => {
    mockRepository.findOneBy.mockResolvedValue({ uuid: 'del-1' } as any);
    mockRepository.delete.mockResolvedValue({} as any);

    const result = await service.delete('del-1');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ uuid: 'del-1' });
    expect(mockRepository.delete).toHaveBeenCalledWith('del-1');
    expect(result).toBeDefined();
  });

  it('should throw ServiceNotFoundException when deleting missing order', async () => {
    mockRepository.findOneBy.mockResolvedValue(null as any);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(ServiceNotFoundException);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
