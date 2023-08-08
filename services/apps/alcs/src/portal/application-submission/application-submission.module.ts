import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../../alcs/application/application.module';
import { ApplicationSubmissionStatusModule } from '../../application-submission-status/application-submission-status.module';
import { ApplicationSubmissionStatusType } from '../../application-submission-status/submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../../application-submission-status/submission-status.entity';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { ApplicationOwnerProfile } from '../../common/automapper/application-owner.automapper.profile';
import { ApplicationParcelProfile } from '../../common/automapper/application-parcel.automapper.profile';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { PdfGenerationModule } from '../pdf-generation/pdf-generation.module';
import { ApplicationOwnerType } from './application-owner/application-owner-type/application-owner-type.entity';
import { ApplicationOwnerController } from './application-owner/application-owner.controller';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { ApplicationOwnerService } from './application-owner/application-owner.service';
import { ApplicationParcelOwnershipType } from './application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import { ApplicationParcelController } from './application-parcel/application-parcel.controller';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationSubmissionValidatorService } from './application-submission-validator.service';
import { ApplicationSubmissionController } from './application-submission.controller';
import { ApplicationSubmission } from './application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';
import { NaruSubtype } from './naru-subtype/naru-subtype.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSubmission,
      ApplicationSubmissionStatusType,
      ApplicationParcel,
      ApplicationParcelOwnershipType,
      ApplicationOwner,
      ApplicationOwnerType,
      NaruSubtype,
      ApplicationSubmissionToSubmissionStatus,
    ]),
    forwardRef(() => ApplicationModule),
    AuthorizationModule,
    forwardRef(() => DocumentModule),
    forwardRef(() => PdfGenerationModule),
    ApplicationSubmissionStatusModule,
    FileNumberModule,
  ],
  providers: [
    ApplicationSubmissionService,
    ApplicationSubmissionProfile,
    ApplicationParcelProfile,
    ApplicationParcelService,
    ApplicationOwnerService,
    ApplicationOwnerProfile,
    ApplicationSubmissionValidatorService,
  ],
  controllers: [
    ApplicationSubmissionController,
    ApplicationParcelController,
    ApplicationOwnerController,
  ],
  exports: [
    ApplicationSubmissionService,
    ApplicationOwnerService,
    ApplicationSubmissionValidatorService,
    ApplicationParcelService,
  ],
})
export class ApplicationSubmissionModule {}
