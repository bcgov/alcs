import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
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
        pin: lookupResult.pin !== '0' ? lookupResult.pin : undefined,
        legalDescription: lookupResult.legalDesc,
        mapArea: Number.parseFloat(lookupResult.gisAreaH).toFixed(2),
      };
    } else {
      throw new ServiceNotFoundException(
        'Failed to find parcel with given PID/PIN',
      );
    }
  }
}
