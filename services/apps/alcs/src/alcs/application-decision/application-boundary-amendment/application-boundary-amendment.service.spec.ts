import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionComponentService } from '../application-decision-v2/application-decision/component/application-decision-component.service';
import {
  CreateApplicationBoundaryAmendmentDto,
  UpdateApplicationBoundaryAmendmentDto,
} from './application-boundary-amendment.dto';
import { ApplicationBoundaryAmendment } from './application-boundary-amendment.entity';
import { ApplicationBoundaryAmendmentService } from './application-boundary-amendment.service';

describe('ApplicationBoundaryAmendmentService', () => {
  let service: ApplicationBoundaryAmendmentService;
  let mockAppDecComService: DeepMocked<ApplicationDecisionComponentService>;
  let mockRepository: DeepMocked<Repository<ApplicationBoundaryAmendment>>;

  beforeEach(async () => {
    mockAppDecComService = createMock();
    mockRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationBoundaryAmendmentService,
        {
          provide: ApplicationDecisionComponentService,
          useValue: mockAppDecComService,
        },
        {
          provide: getRepositoryToken(ApplicationBoundaryAmendment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationBoundaryAmendmentService>(
      ApplicationBoundaryAmendmentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call find on the repo for list', async () => {
    mockRepository.find.mockResolvedValue([]);
    const mockFileNumber = 'fileNumber';
    const res = await service.list(mockFileNumber);

    expect(res).toBeDefined();
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call save on the repo for create', async () => {
    mockRepository.save.mockResolvedValue(new ApplicationBoundaryAmendment());
    const mockFileNumber = 'fileNumber';
    const createDto: CreateApplicationBoundaryAmendmentDto = {
      period: 1,
      year: 1990,
      type: '',
      decisionComponentUuids: [],
      area: 0,
    };

    const res = await service.create(mockFileNumber, createDto);

    expect(res).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith({
      ...createDto,
      decisionComponents: [],
      fileNumber: mockFileNumber,
    });
  });

  it('should call save on the repo for update', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(
      new ApplicationBoundaryAmendment(),
    );
    mockRepository.save.mockResolvedValue(new ApplicationBoundaryAmendment());
    const mockUuid = 'uuid';
    const updateDto: UpdateApplicationBoundaryAmendmentDto = {
      period: 1,
      year: 1990,
      type: '',
      area: 0,
    };

    const res = await service.update(mockUuid, updateDto);

    expect(res).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(updateDto);
  });

  it('should call remove on the repo for delete', async () => {
    const mockAmendment = new ApplicationBoundaryAmendment();
    mockRepository.findOneOrFail.mockResolvedValue(mockAmendment);
    mockRepository.remove.mockResolvedValue(new ApplicationBoundaryAmendment());
    const mockUuid = 'uuid';
    const res = await service.delete(mockUuid);

    expect(res).toBeDefined();
    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    expect(mockRepository.remove).toHaveBeenCalledWith(mockAmendment);
  });
});
