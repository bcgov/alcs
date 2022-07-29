import { AutoMap } from '@automapper/classes';
import { BaseCodeDto } from '../../common/dtos/base.dto';

export class ApplicationStatusDto extends BaseCodeDto {
  @AutoMap()
  label: string;
}
