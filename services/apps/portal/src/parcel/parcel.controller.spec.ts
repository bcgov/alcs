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

  it('should lookup and return a mapped parcel for PID', async () => {
    const mockRes = {
      pin: '12345',
      legalDescription: 'LEGAL DESC',
      gisAreaHa: '0.612316',
    } as ParcelLookup;
    mockParcelService.fetchByPid.mockResolvedValue(mockRes);

    const res = await controller.searchByPid({
      pid: '512315',
      type: 'pid',
    });
    expect(mockParcelService.fetchByPid).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.pin).toEqual(mockRes.pin);
  });

  it('should lookup and return a mapped parcel for PIN', async () => {
    const mockRes = {
      pin: '12345',
      legalDescription: 'LEGAL DESC',
      gisAreaHa: '0.612316',
    } as ParcelLookup;
    mockParcelService.fetchByPin.mockResolvedValue(mockRes);

    const res = await controller.searchByPid({
      pid: '512315',
      type: 'pin',
    });
    expect(mockParcelService.fetchByPin).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();
    expect(res?.pin).toEqual(mockRes.pin);
  });

  it('should throw an exception if parcel is not found for PID', async () => {
    mockParcelService.fetchByPid.mockResolvedValue(null);

    const promise = controller.searchByPid({
      pid: '1251231',
      type: 'pid',
    });
    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find parcel with given PID/PIN'),
    );
  });
});
