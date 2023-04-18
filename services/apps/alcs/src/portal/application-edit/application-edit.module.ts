import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationOwnerType } from '../application-submission/application-owner/application-owner-type/application-owner-type.entity';
import { ApplicationOwner } from '../application-submission/application-owner/application-owner.entity';
import { ApplicationParcelOwnershipType } from '../application-submission/application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import { ApplicationParcel } from '../application-submission/application-parcel/application-parcel.entity';
import { ApplicationStatus } from '../application-submission/application-status/application-status.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationEditService } from './application-edit.service';
import { ApplicationEditController } from './application-edit.controller';

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
  ],
  providers: [ApplicationEditService],
  controllers: [ApplicationEditController],
})
export class ApplicationEditModule {}
