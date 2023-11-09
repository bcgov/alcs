import { AutoMap } from 'automapper-classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class NotificationTypeDto extends BaseCodeDto {
  @AutoMap()
  shortLabel: string;

  @AutoMap()
  backgroundColor: string;

  @AutoMap()
  textColor: string;
}
