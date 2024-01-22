import { AutoMap } from 'automapper-classes';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApplicationSubmissionReviewDto {
  @AutoMap()
  applicationFileNumber: string;

  @AutoMap(() => String)
  localGovernmentFileNumber: string | null;

  @AutoMap(() => String)
  firstName: string | null;

  @AutoMap(() => String)
  lastName: string | null;

  @AutoMap(() => String)
  position: string | null;

  @AutoMap(() => String)
  department: string | null;

  @AutoMap(() => String)
  phoneNumber: string | null;

  @AutoMap(() => String)
  email: string | null;

  @AutoMap(() => Boolean)
  isOCPDesignation: boolean | null;

  @AutoMap(() => String)
  OCPBylawName: string | null;

  @AutoMap(() => String)
  OCPDesignation: string | null;

  @AutoMap(() => Boolean)
  OCPConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isSubjectToZoning: boolean | null;

  @AutoMap(() => String)
  zoningBylawName: string | null;

  @AutoMap(() => String)
  zoningDesignation: string | null;

  @AutoMap(() => String)
  zoningMinimumLotSize: string | null;

  @AutoMap(() => Boolean)
  isZoningConsistent: boolean | null;

  @AutoMap(() => Boolean)
  isAuthorized: boolean | null;

  isFirstNationGovernment: boolean;
  governmentName: string;
}

export class UpdateApplicationSubmissionReviewDto {
  @IsOptional()
  @IsString()
  localGovernmentFileNumber?: string | null;

  @IsOptional()
  @IsString()
  firstName?: string | null;

  @IsOptional()
  @IsString()
  lastName?: string | null;

  @IsOptional()
  @IsString()
  position?: string | null;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsBoolean()
  isOCPDesignation?: boolean | null;

  @IsOptional()
  @IsString()
  OCPBylawName?: string | null;

  @IsOptional()
  @IsString()
  OCPDesignation?: string | null;

  @IsOptional()
  @IsBoolean()
  OCPConsistent?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isSubjectToZoning?: boolean | null;

  @IsOptional()
  @IsString()
  zoningBylawName?: string | null;

  @IsOptional()
  @IsString()
  zoningDesignation?: string | null;

  @IsOptional()
  @IsString()
  zoningMinimumLotSize?: string | null;

  @IsOptional()
  @IsBoolean()
  isZoningConsistent?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isAuthorized?: boolean | null;
}

export class ReturnApplicationSubmissionDto {
  @IsString()
  reasonForReturn: 'incomplete' | 'wrongGovernment';

  @IsString()
  applicantComment: string;
}
