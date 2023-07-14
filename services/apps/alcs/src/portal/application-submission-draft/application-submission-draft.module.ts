import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSubmissionStatusType } from '../../application-submission-status/submission-status-type.entity';
import { ApplicationOwnerType } from '../application-submission/application-owner/application-owner-type/application-owner-type.entity';
import { ApplicationOwner } from '../application-submission/application-owner/application-owner.entity';
import { ApplicationParcelOwnershipType } from '../application-submission/application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { PdfGenerationModule } from '../pdf-generation/pdf-generation.module';
import { ApplicationSubmissionDraftController } from './application-submission-draft.controller';
import { ApplicationSubmissionDraftService } from './application-submission-draft.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSubmission,
      ApplicationSubmissionStatusType,
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
