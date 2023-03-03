import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { ParcelLookupDto, SearchParcelDto } from './parcel.dto';
import { ParcelService } from './parcel.service';

@Controller('parcel')
@UseGuards(AuthGuard)
export class ParcelController {
  constructor(private parcelService: ParcelService) {}

  @Get('search/:type/:pid')
  async searchByPid(
    @Param() params: SearchParcelDto,
  ): Promise<ParcelLookupDto | undefined> {
    const lookupResult =
      params.type === 'pin'
        ? await this.parcelService.fetchByPin(params.pid)
        : await this.parcelService.fetchByPid(params.pid);
    if (lookupResult) {
      return {
        pid: lookupResult.pid,
        pin: lookupResult.pin,
        legalDescription: lookupResult.legalDescription,
        mapArea: Number.parseFloat(lookupResult.gisAreaHa).toFixed(2),
      };
    } else {
      throw new ServiceNotFoundException(
        'Failed to find parcel with given PID/PIN',
      );
    }
  }
}
