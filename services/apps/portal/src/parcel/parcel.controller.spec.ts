import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { ParcelLookup } from './parcel-lookup.entity';
import { ParcelController } from './parcel.controller';
import { ParcelService } from './parcel.service';

describe('ParcelController', () => {
  let controller: ParcelController;
  let mockParcelService: DeepMocked<ParcelService>;

  beforeEach(async () => {
    mockParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParcelController],
      providers: [
        {
          provide: ParcelService,
          useValue: mockParcelService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ParcelController>(ParcelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should lookup and return a mapped parcel', async () => {
    const mockRes = {
      pin: '12345',
      legalDesc: 'LEGAL DESC',
      gisAreaH: '0.612316',
    } as ParcelLookup;
    mockParcelService.fetchByPidPin.mockResolvedValue(mockRes);

    const res = await controller.searchByPidPin({
      pid: '512315',
    });
    expect(res).toBeDefined();
    expect(res?.pin).toEqual(mockRes.pin);
  });

  it('should throw an exception if parcel is not found', async () => {
    mockParcelService.fetchByPidPin.mockResolvedValue(null);

    const promise = controller.searchByPidPin({
      pid: '1251231',
    });
    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find parcel with given PID/PIN'),
    );
  });
});
