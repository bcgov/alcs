import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { ParcelLookupDto } from './parcel.dto';
import { ParcelService } from './parcel.service';

@Controller('parcel')
@UseGuards(AuthGuard)
export class ParcelController {
  constructor(private parcelService: ParcelService) {}

  @Get('search/:number')
  async searchByPidPin(
    @Param('number') number: string,
  ): Promise<ParcelLookupDto | undefined> {
    const parsedNum = Number.parseInt(number);
    if (parsedNum === 0 || isNaN(parsedNum)) {
      throw new BadRequestException(
        'Please pass a valid number to search by PID/PIN',
      );
    }
    const lookupResult = await this.parcelService.fetchByPidPin(number);
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
