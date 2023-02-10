import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { ParcelLookupDto, SearchParcelDto } from './parcel.dto';
import { ParcelService } from './parcel.service';

@Controller('parcel')
@UseGuards(AuthGuard)
export class ParcelController {
  constructor(private parcelService: ParcelService) {}

  @Get('search/:pid')
  async searchByPidPin(
    @Param() params: SearchParcelDto,
  ): Promise<ParcelLookupDto | undefined> {
    const lookupResult = await this.parcelService.fetchByPidPin(params.pid);
    if (lookupResult) {
      return {
        pin: lookupResult.pin,
        pid: lookupResult.pid,
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
