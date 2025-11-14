import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ClsService } from 'nestjs-cls';
import { AutomapperModule } from 'automapper-nestjs';
import { classes } from 'automapper-classes';
import { ComplianceAndEnforcementChronologyController } from './chronology.controller';
import { ComplianceAndEnforcementChronologyService } from './chronology.service';

describe('ComplianceAndEnforcementController', () => {
  let controller: ComplianceAndEnforcementChronologyController;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementChronologyService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ComplianceAndEnforcementChronologyController],
      providers: [
        {
          provide: ComplianceAndEnforcementChronologyService,
          useValue: mockComplianceAndEnforcementService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ComplianceAndEnforcementChronologyController>(ComplianceAndEnforcementChronologyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
