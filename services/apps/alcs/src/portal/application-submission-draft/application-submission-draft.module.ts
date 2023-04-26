import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../../alcs/application/application.module';
import { ApplicationOwnerType } from '../application-submission/application-owner/application-owner-type/application-owner-type.entity';
import { ApplicationOwner } from '../application-submission/application-owner/application-owner.entity';
import { ApplicationParcelOwnershipType } from '../application-submission/application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationStatus } from '../application-submission/application-status/application-status.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { PdfGenerationModule } from '../pdf-generation/pdf-generation.module';
import { ApplicationSubmissionDraftService } from './application-submission-draft.service';
import { ApplicationSubmissionDraftController } from './application-submission-draft.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSubmission,
      ApplicationStatus,
      ApplicationParcel,
      ApplicationParcelOwnershipType,
      ApplicationOwner,
      ApplicationOwnerType,
    ]),
    ApplicationSubmissionModule,
    PdfGenerationModule,
  ],
  providers: [ApplicationSubmissionDraftService],
  controllers: [ApplicationSubmissionDraftController],
})
export class ApplicationSubmissionDraftModule {}
