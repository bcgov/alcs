import { AutoMap } from 'automapper-classes';
import { IsBoolean } from 'class-validator';
import { Entity } from 'typeorm';
import { BaseCodeDto } from '../../../common/dtos/base.dto';

@Entity()
export class ApplicationDecisionMakerCodeDto extends BaseCodeDto {
  @AutoMap()
  @IsBoolean()
  isActive: boolean;
}
