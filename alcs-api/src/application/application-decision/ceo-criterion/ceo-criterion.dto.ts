import { AutoMap } from '@automapper/classes';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class CeoCriterionCodeDto extends BaseCodeDto {
  @AutoMap()
  number: number;
}
