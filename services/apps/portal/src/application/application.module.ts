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
import { ApplicationParcelController } from './application-parcel/application-parcel-controller';
import { ApplicationParcelOwnershipType } from './application-parcel/application-parcel-ownership-type/application-parcel-ownership-type.entity';
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
  ],
  controllers: [
    ApplicationController,
    ApplicationDocumentController,
    ApplicationParcelController,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
