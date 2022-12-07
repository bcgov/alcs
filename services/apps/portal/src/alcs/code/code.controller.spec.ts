import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationTypeService } from '../application-type/application-type.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { CodeController } from './code.controller';

describe('CodeController', () => {
  let portalController: CodeController;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockAppTypeService: DeepMocked<ApplicationTypeService>;

  beforeEach(async () => {
    mockLgService = createMock();
    mockAppTypeService = createMock();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [CodeController],
      providers: [
        CodeController,
        {
          provide: LocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: ApplicationTypeService,
          useValue: mockAppTypeService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    portalController = app.get<CodeController>(CodeController);

    mockLgService.get.mockResolvedValue([
      {
        uuid: 'fake-uuid',
        name: 'fake-name',
      },
    ]);
    mockAppTypeService.list.mockResolvedValue([]);
  });

  it('should call out to local government service for fetching codes', async () => {
    const codes = await portalController.loadCodes();
    expect(codes.localGovernments).toBeDefined();
    expect(codes.localGovernments.length).toBe(1);
    expect(codes.localGovernments[0].name).toEqual('fake-name');
    expect(mockAppTypeService.list).toHaveBeenCalledTimes(1);
  });
});
