import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationParcelController } from './application-parcel.controller';
import { ApplicationParcelService } from './application-parcel.service';

describe('ApplicationParcelController', () => {
  let controller: ApplicationParcelController;
  let mockParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationParcelController],
      providers: [
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationParcelController>(
      ApplicationParcelController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
