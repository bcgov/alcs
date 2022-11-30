import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../alcs/alcs.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
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
    ]),
    AlcsModule,
    AuthorizationModule,
  ],
  providers: [
    ApplicationService,
    ApplicationDocumentService,
    ApplicationProfile,
  ],
  controllers: [ApplicationController],
})
export class ApplicationModule {}
