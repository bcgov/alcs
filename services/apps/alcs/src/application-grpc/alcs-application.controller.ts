import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationLocalGovernmentService } from '../application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../application/application-document/application-document.service';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import {
  ApplicationCreateGrpcRequest,
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';
import {
  AlcsApplicationService,
  GRPC_APPLICATION_SERVICE_NAME,
} from './alcs-application.service.interface';

@Controller('application-grpc')
export class ApplicationGrpcController implements AlcsApplicationService {
  private logger = new Logger(ApplicationGrpcController.name);

  constructor(
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @GrpcMethod(GRPC_APPLICATION_SERVICE_NAME, 'create')
  async create(
    data: ApplicationCreateGrpcRequest,
  ): Promise<ApplicationGrpcResponse> {
    this.logger.debug('ALCS-> GRPC -> AlcsApplicationService -> create');

    const localGovernment = await this.localGovernmentService.getByUuid(
      data.localGovernmentUuid,
    );

    const application = await this.applicationService.create({
      ...data,
      regionCode: localGovernment?.preferredRegion.code,
      dateSubmittedToAlc: new Date(Number(data.dateSubmittedToAlc)),
      statusHistory: data.statusHistory.map((history) => ({
        ...history,
        time: parseInt(history.time, 10),
      })),
      submittedApplication: data.submittedApplication,
    });

    const certificateOfTiles = data.submittedApplication.parcels
      .flatMap((parcel) => parcel.documentUuids)
      .map((uuid) => ({
        documentUuid: uuid,
        type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
      }));

    const corporateSummaries = data.submittedApplication.parcels
      .flatMap((parcel) => parcel.owners)
      .filter((owner) => !!owner.corporateSummaryDocumentUuid)
      .map((owner) => ({
        documentUuid: owner.corporateSummaryDocumentUuid!,
        type: DOCUMENT_TYPE.CORPORATE_SUMMARY,
      }));

    const allDocuments = [
      ...data.documents,
      ...certificateOfTiles,
      ...corporateSummaries,
    ];

    await this.applicationDocumentService.attachExternalDocuments(
      application.fileNumber,
      allDocuments,
    );

    return this.mapper.mapAsync(
      application,
      Application,
      ApplicationGrpcResponse,
    );
  }

  @GrpcMethod(GRPC_APPLICATION_SERVICE_NAME, 'generateFileNumber')
  async generateFileNumber(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ApplicationFileNumberGenerateGrpcRequest: any,
  ): Promise<ApplicationFileNumberGenerateGrpcResponse> {
    return {
      fileNumber: await this.applicationService.generateNextFileNumber(),
    };
  }
}
