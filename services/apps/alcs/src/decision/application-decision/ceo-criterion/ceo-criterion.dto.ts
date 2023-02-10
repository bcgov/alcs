import { AutoMap } from '@automapper/classes';
import { IsNumber } from 'class-validator';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

export class CeoCriterionCodeDto extends BaseCodeDto {
  @AutoMap()
  @IsNumber()
  number: number;
}
