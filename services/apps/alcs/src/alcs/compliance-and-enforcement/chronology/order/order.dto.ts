import { AutoMap } from 'automapper-classes';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AllegedActivity, OrderType } from '../../compliance-and-enforcement.enum';
import { ComplianceAndEnforcementDocumentDto } from '../../document/document.dto';

export enum NotificationMethods {
  EMAIL = 'Email',
  PERSONALLY = 'Personally',
  POSTED_ON_PROPERTY = 'Posted on Property',
  REGISTERED_MAIL = 'Registered Mail',
}

export class OrderNotification {
  @AutoMap()
  method!: NotificationMethods;

  @AutoMap()
  date!: string | null;
}

export class OrderDto {
  @AutoMap()
  uuid!: string;

  @AutoMap()
  createdAt!: number;

  @AutoMap()
  isDraft!: boolean;

  @AutoMap()
  date!: string | null;

  @AutoMap()
  type!: OrderType | null;

  @AutoMap()
  allegedActivity!: AllegedActivity[];

  @AutoMap()
  amount!: string | null;

  @AutoMap()
  notifications!: OrderNotification[];

  @AutoMap()
  documents!: ComplianceAndEnforcementDocumentDto[];

  @AutoMap()
  entryUuid!: string;

  @AutoMap()
  dueDates!: OrderDueDateDto[];

  @AutoMap()
  issuedToIndividualResponsiblePartyUuid!: string | null;

  @AutoMap()
  issuedToDirectorUuid!: string | null;
}

export class UpdateOrderDto {
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @AutoMap()
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @AutoMap()
  @IsOptional()
  @IsString()
  type?: OrderType | null;

  @AutoMap()
  @IsOptional()
  allegedActivity?: AllegedActivity[];

  @AutoMap()
  @IsOptional()
  @IsString()
  amount?: string | null;

  @AutoMap()
  @IsOptional()
  notifications?: OrderNotification[];

  @AutoMap()
  @IsOptional()
  @IsString()
  entryUuid?: string;

  @AutoMap()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDueDateDto)
  dueDates?: UpdateOrderDueDateDto[];

  @AutoMap()
  @IsOptional()
  @IsString()
  issuedToIndividualResponsiblePartyUuid?: string | null;

  @AutoMap()
  @IsOptional()
  @IsString()
  issuedToDirectorUuid?: string | null;
}

export class OrderDueDateDto {
  @AutoMap()
  uuid!: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  date!: string;

  @AutoMap()
  completedDate!: number | null;

  @AutoMap()
  comment!: string;
}

export class UpdateOrderDueDateDto {
  @AutoMap()
  @IsOptional()
  @IsString()
  uuid?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  orderUuid?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  date?: string;

  @AutoMap()
  @IsOptional()
  @IsNumber()
  completedDate?: number | null;

  @AutoMap()
  @IsOptional()
  @IsString()
  comment?: string;
}
