import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { DecisionDocument } from './decision-document.entity';

@Injectable()
export class ApplicationDecisionService {
  constructor(
    @InjectRepository(ApplicationDecision)
    private appDecisionRepository: Repository<ApplicationDecision>,
    @InjectRepository(DecisionDocument)
    private decisionDocumentRepository: Repository<DecisionDocument>,
    private applicationService: ApplicationService,
    private documentService: DocumentService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.get(number);

    if (!application) {
      throw new ServiceNotFoundException(
        `Application with provided number not found ${number}`,
      );
    }

    return this.appDecisionRepository.find({
      where: { applicationUuid: application.uuid },
      order: {
        date: 'DESC',
        documents: {
          document: {
            uploadedAt: 'DESC',
          },
        },
      },
      relations: {
        documents: {
          document: {
            uploadedBy: true,
          },
        },
      },
    });
  }

  get(uuid) {
    return this.appDecisionRepository.findOne({
      where: { uuid },
      relations: {
        documents: true,
      },
    });
  }

  async update(uuid: string, updateData: UpdateApplicationDecisionDto) {
    const decisionMeeting = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
    });

    if (!decisionMeeting) {
      throw new ServiceNotFoundException(
        `Decison Meeting with UUID ${uuid} not found`,
      );
    }

    decisionMeeting.date = new Date(updateData.date);
    decisionMeeting.outcome = updateData.outcome;

    return this.appDecisionRepository.save(decisionMeeting);
  }

  async create(
    decisionMeeting: CreateApplicationDecisionDto,
    application: Application,
  ) {
    const decision = new ApplicationDecision({
      outcome: decisionMeeting.outcome,
      date: new Date(decisionMeeting.date),
      application,
    });

    return this.appDecisionRepository.save(decision);
  }

  async delete(uuid) {
    const applicationDecision = await this.get(uuid);
    for (const document of applicationDecision.documents) {
      await this.deleteDocument(document.uuid);
    }
    return this.appDecisionRepository.softRemove([applicationDecision]);
  }

  async attachDocument(decisionUuid: string, file: MultipartFile, user: User) {
    const decision = await this.appDecisionRepository.findOne({
      where: {
        uuid: decisionUuid,
      },
    });
    if (!decision) {
      throw new ServiceNotFoundException(`Decision not Found ${decisionUuid}`);
    }

    const document = await this.documentService.create(
      `decision/${decision.uuid}`,
      file,
      user,
    );
    const appDocument = new DecisionDocument({
      decision,
      document,
    });

    return this.decisionDocumentRepository.save(appDocument);
  }

  async deleteDocument(documentUuid: string) {
    const decisionDocument = await this.decisionDocumentRepository.findOne({
      where: {
        uuid: documentUuid,
      },
      relations: {
        document: true,
      },
    });

    if (!decisionDocument) {
      throw new ServiceNotFoundException(
        `Failed to find document with uuid ${documentUuid}`,
      );
    }

    await this.documentService.softRemove(decisionDocument.document);
    return decisionDocument;
  }

  async getDownloadUrl(decisionDocumentUuid: string, openInline = false) {
    const decisionDocument = await this.decisionDocumentRepository.findOne({
      where: {
        uuid: decisionDocumentUuid,
      },
      relations: {
        document: true,
      },
    });

    if (!decisionDocument) {
      throw new ServiceNotFoundException(
        `Failed to find document with uuid ${decisionDocumentUuid}`,
      );
    }

    return this.documentService.getDownloadUrl(
      decisionDocument.document,
      openInline,
    );
  }
}
