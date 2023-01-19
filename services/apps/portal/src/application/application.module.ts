import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../alcs/alcs.module';
import { ApplicationGrpcModule } from '../alcs/application-grpc/application-grpc.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { ApplicationParcelProfile } from '../common/automapper/application-parcel.automapper.profile';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { DocumentModule } from '../document/document.module';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationParcelDocumentController } from './application-parcel/application-parcel-document/application-parcel-document.controller';
import { ApplicationParcelDocument } from './application-parcel/application-parcel-document/application-parcel-document.entity';
import { ApplicationParcelDocumentService } from './application-parcel/application-parcel-document/application-parcel-document.service';
import { ApplicationParcelOwnershipType } from './application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
import { ApplicationParcelController } from './application-parcel/application-parcel.controller';
import { ApplicationParcel } from './application-parcel/application-parcel.entity';
import { ApplicationParcelService } from './application-parcel/application-parcel.service';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationDocument,
      ApplicationStatus,
      ApplicationParcel,
      ApplicationParcelOwnershipType,
      ApplicationParcelDocument,
    ]),
    AlcsModule,
    AuthorizationModule,
    ApplicationGrpcModule,
    DocumentModule,
  ],
  providers: [
    ApplicationService,
    ApplicationDocumentService,
    ApplicationProfile,
    ApplicationParcelProfile,
    ApplicationParcelService,
    ApplicationParcelDocumentService,
  ],
  controllers: [
    ApplicationController,
    ApplicationDocumentController,
    ApplicationParcelController,
    ApplicationParcelDocumentController,
  ],
  exports: [ApplicationService, ApplicationDocumentService],
})
export class ApplicationModule {}
