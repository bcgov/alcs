import { BaseCodeDto } from '../../common/dtos/base.dto';

export class LocalGovernmentDto {
  uuid: string;
  name: string;
  hasGuid: boolean;
}

export class ApplicationTypeDto {
  code: string;
  portalLabel: string;
  htmlDescription: string;
}

export class SubmissionTypeDto extends BaseCodeDto {
  portalHtmlDescription: string;
}
