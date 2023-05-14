import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponentService } from './component.service';
import { ApplicationDecisionComponent } from './decision-component.entity';

describe('ComponentService', () => {
  let service: ComponentService;
  let mockApplicationDecisionComponentRepository: DeepMocked<
    Repository<ApplicationDecisionComponent>
  >;

  beforeEach(async () => {
    mockApplicationDecisionComponentRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComponentService,
        {
          provide: getRepositoryToken(ApplicationDecisionComponent),
          useValue: mockApplicationDecisionComponentRepository,
        },
      ],
    }).compile();

    service = module.get<ComponentService>(ComponentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
