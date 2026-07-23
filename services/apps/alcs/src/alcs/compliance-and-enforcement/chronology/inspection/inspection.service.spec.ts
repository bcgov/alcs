import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import * as config from 'config';
import { Repository } from 'typeorm';
import { CdogsService } from '../../../../../../../libs/common/src/cdogs/cdogs.service';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { UserService } from '../../../../user/user.service';
import { ComplianceAndEnforcement } from '../../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementService } from '../../compliance-and-enforcement.service';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { ComplianceAndEnforcementChronologyService } from '../chronology.service';
import { ComplianceAndEnforcementChronologyInspectionProfile } from './inspection.automapper.profile';
import { ComplianceAndEnforcementChronologyInspection } from './inspection.entity';
import { ComplianceAndEnforcementChronologyInspectionService } from './inspection.service';

describe('ComplianceAndEnforcementChronologyInspectionService', () => {
  let service: ComplianceAndEnforcementChronologyInspectionService;
  let mockRepository: DeepMocked<Repository<ComplianceAndEnforcementChronologyInspection>>;

  let mockChronologyService: DeepMocked<ComplianceAndEnforcementChronologyService>;
  let mockChronologyRepository: DeepMocked<Repository<ComplianceAndEnforcementChronologyEntry>>;

  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockComplianceAndEnforcementRepository: DeepMocked<Repository<ComplianceAndEnforcement>>;

  let mockUserService: DeepMocked<UserService>;

  let mockDocumentGenerationService: DeepMocked<CdogsService>;

  beforeEach(async () => {
    mockRepository = createMock<Repository<ComplianceAndEnforcementChronologyInspection>>();

    mockChronologyService = createMock<ComplianceAndEnforcementChronologyService>();
    mockChronologyRepository = createMock<Repository<ComplianceAndEnforcementChronologyEntry>>();

    mockComplianceAndEnforcementService = createMock<ComplianceAndEnforcementService>();
    mockComplianceAndEnforcementRepository = createMock<Repository<ComplianceAndEnforcement>>();

    mockUserService = createMock<UserService>();
    mockDocumentGenerationService = createMock<CdogsService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ComplianceAndEnforcementChronologyInspectionService,
        ComplianceAndEnforcementChronologyInspectionProfile,
        {
          provide: getRepositoryToken(ComplianceAndEnforcementChronologyInspection),
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
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CdogsService,
          useValue: mockDocumentGenerationService,
        },
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<ComplianceAndEnforcementChronologyInspectionService>(
      ComplianceAndEnforcementChronologyInspectionService,
    );
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(0));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getAll and return mapped inspections', async () => {
    const entity = new ComplianceAndEnforcementChronologyInspection({
      uuid: 'i-1',
      createdAt: new Date(),
      isDraft: false,
      comments: 'c',
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

  it('should update existing inspection', async () => {
    mockRepository.findOneBy.mockResolvedValue(
      new ComplianceAndEnforcementChronologyInspection({ uuid: 'u-1' }) as any,
    );
    mockRepository.save.mockResolvedValue(
      new ComplianceAndEnforcementChronologyInspection({ uuid: 'u-1', comments: 'updated' }) as any,
    );

    const result = await service.update('u-1', { comments: 'updated' } as any);

    expect(result).toBeDefined();
    expect((result as any).comments).toBe('updated');
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ uuid: 'u-1' });
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw ServiceConflictException when updating missing inspection', async () => {
    mockRepository.findOneBy.mockResolvedValue(null as any);

    await expect(service.update('missing', {} as any)).rejects.toBeInstanceOf(ServiceConflictException);
  });

  it('should delete existing inspection', async () => {
    mockRepository.findOneBy.mockResolvedValue({ uuid: 'del-1' } as any);
    mockRepository.delete.mockResolvedValue({} as any);

    const result = await service.delete('del-1');

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ uuid: 'del-1' });
    expect(mockRepository.delete).toHaveBeenCalledWith('del-1');
    expect(result).toBeDefined();
  });

  it('should throw ServiceNotFoundException when deleting missing inspection', async () => {
    mockRepository.findOneBy.mockResolvedValue(null as any);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(ServiceNotFoundException);
  });

  it('should generate report template data document', async () => {
    const inspectionEntity: any = {
      uuid: 'r-1',
      entry: {
        file: {
          fileNumber: 'FILE-123',
          properties: [{ localGovernment: 'LG' }],
        },
      },
    };

    // stub mapper to avoid requiring real automapper mappings in unit test
    const propertyDto = { localGovernment: 'LG' } as any;
    const inspectionDto = { uuid: 'r-1' } as any;
    (service as any).mapper = {
      map: jest.fn()
        .mockImplementationOnce(() => propertyDto)
        .mockImplementationOnce(() => inspectionDto),
    };

    mockRepository.findOne.mockResolvedValue(inspectionEntity as any);

    const document = { data: Buffer.from('doc-bytes') } as any;
    mockDocumentGenerationService.generateDocument.mockReturnValue(document as any);

    const result = await service.reportTemplateData('r-1', { uuid: 'user-1' } as any);

    expect(mockRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { uuid: 'r-1' }, relations: expect.any(Object) }),
    );

    const expectedTemplatePath = `${config.get<string>('CDOGS.TEMPLATE_FOLDER')}/inspection-report/inspection-report-template.docx`;

    expect(mockDocumentGenerationService.generateDocument).toHaveBeenCalledWith(
      'inspection-report-template',
      expectedTemplatePath,
      expect.objectContaining({ fileNumber: 'FILE-123' }),
      'docx',
    );

    expect(result).toBe(document);
  });

  it('should throw ServiceNotFoundException when report data missing', async () => {
    mockRepository.findOne.mockResolvedValue(null as any);

    await expect(service.reportTemplateData('missing', { uuid: 'user' } as any)).rejects.toBeInstanceOf(
      ServiceNotFoundException,
    );
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
