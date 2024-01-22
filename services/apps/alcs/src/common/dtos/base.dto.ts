import { AutoMap } from 'automapper-classes';
import { IsString, MaxLength, MinLength } from 'class-validator';

export abstract class BaseCodeDto {
  @AutoMap()
  @IsString()
  label: string;

  @AutoMap()
  @IsString()
  @MaxLength(4)
  @MinLength(4)
  code: string;

  @AutoMap()
  @IsString()
  description: string;
}
