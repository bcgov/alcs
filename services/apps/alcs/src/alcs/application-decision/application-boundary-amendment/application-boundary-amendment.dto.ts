import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from 'automapper-classes';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApplicationBoundaryAmendmentDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  fileNumber: string;

  @AutoMap()
  type: string;

  @AutoMap()
  area: number;

  @AutoMap(() => Number)
  year?: number;

  @AutoMap(() => Number)
  period?: number;

  decisionComponents: BoundaryDecisionComponent[];
}

export class BoundaryDecisionComponent {
  label: string;
  uuid: string;
}

export class CreateApplicationBoundaryAmendmentDto {
  @IsString()
  type: string;

  @IsNumber()
  area: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  period?: number;

  @IsArray()
  decisionComponentUuids: string[];
}

export class UpdateApplicationBoundaryAmendmentDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  period?: number;

  @IsArray()
  @IsOptional()
  decisionComponentUuids?: string[];
}
