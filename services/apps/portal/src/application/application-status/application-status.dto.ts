import { BaseCodeDto } from '../../common/dtos/base.dto';

export enum APPLICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM',
  SUBMITTED_TO_LG = 'SUBG',
  CANCELLED = 'CANC',
}

export class ApplicationStatusDto extends BaseCodeDto {}
