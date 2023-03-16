import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../../alcs/alcs.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { ApplicationOwnerProfile } from '../../common/automapper/application-owner.automapper.profile';
import { ApplicationParcelProfile } from '../../common/automapper/application-parcel.automapper.profile';
import { ApplicationProposalProfile } from '../../common/automapper/application-proposal.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationOwnerType } from './application-owner/application-owner-type/application-owner-type.entity';
import { ApplicationOwnerController } from './application-owner/application-owner.controller';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { ApplicationOwnerService } from './application-owner/application-owner.service';
import { ApplicationParcelDocumentController } from './application-parcel/application-parcel-document/application-parcel-document.controller';
import { ApplicationParcelDocument } from './application-parcel/application-parcel-document/application-parcel-document.entity';
import { ApplicationParcelDocumentService } from './application-parcel/application-parcel-document/application-parcel-document.service';
import { ApplicationParcelOwnershipType } from './application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import { ApplicationParcelController } from './application-parcel/application-parcel.controller';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationProposalStatusSubscriber } from './application-proposal-status.subscriber';
import { ApplicationProposalValidatorService } from './application-proposal-validator.service';
import { ApplicationProposalController } from './application-proposal.controller';
import { ApplicationProposal } from './application-proposal.entity';
import { ApplicationProposalService } from './application-proposal.service';
import { ApplicationStatus } from './application-status/application-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationProposal,
      ApplicationDocument,
      ApplicationStatus,
      ApplicationParcel,
      ApplicationParcelOwnershipType,
      ApplicationParcelDocument,
      ApplicationOwner,
      ApplicationOwnerType,
    ]),
    AlcsModule,
    AuthorizationModule,
    DocumentModule,
  ],
  providers: [
    ApplicationProposalService,
    ApplicationDocumentService,
    ApplicationProposalProfile,
    ApplicationParcelProfile,
    ApplicationParcelService,
    ApplicationParcelDocumentService,
    ApplicationOwnerService,
    ApplicationOwnerProfile,
    ApplicationProposalStatusSubscriber,
    ApplicationProposalValidatorService,
  ],
  controllers: [
    ApplicationProposalController,
    ApplicationDocumentController,
    ApplicationParcelController,
    ApplicationParcelDocumentController,
    ApplicationOwnerController,
  ],
  exports: [
    ApplicationProposalService,
    ApplicationDocumentService,
    ApplicationOwnerService,
    ApplicationProposalValidatorService,
  ],
})
export class ApplicationProposalModule {}
