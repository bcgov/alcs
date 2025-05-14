import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import {
  BaseServiceException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MultipartFile } from '@fastify/multipart';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ClamAVService } from '../clamav/clamav.service';
import { User } from '../user/user.entity';
import { CreateDocumentDto, DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from './document.dto';
import { Document } from './document.entity';
import { VISIBILITY_FLAG } from '../alcs/application/application-document/application-document.entity';

const DEFAULT_DB_TAGS = ['ORCS Classification: 85100-20'];
const DEFAULT_S3_TAGS = 'ORCS-Classification=85100-20';

@Injectable()
export class DocumentService {
  private dataStore: S3Client;
  private logger = new Logger(DocumentService.name);
  private bucket = this.config.get<string>('STORAGE.BUCKET');
  private documentTimeout = this.config.get<number>('DOCUMENT_TIMEOUT');

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private clamAvService: ClamAVService,
    private dataSource: DataSource,
  ) {
    this.dataStore = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.get('STORAGE.ACCESS_KEY'),
        secretAccessKey: this.config.get('STORAGE.SECRET_KEY'),
      },
      forcePathStyle: true,
      endpoint: this.config.get('STORAGE.URL'),
    });
  }

  async create(
    filePath: string,
    fileName: string,
    file: MultipartFile,
    user: User,
    source = DOCUMENT_SOURCE.ALC,
    system: DOCUMENT_SYSTEM,
  ) {
    const fileKey = `${filePath}/${v4()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: await file.toBuffer(),
      ACL: 'bucket-owner-full-control',
      Tagging: DEFAULT_S3_TAGS,
      ContentType: file.mimetype,
      ContentLength: file.file.bytesRead,
    });
    await this.dataStore.send(command);
    const document = await this.createDocumentRecord({
      fileKey: fileKey,
      fileSize: file.file.bytesRead,
      mimeType: file.mimetype,
      uploadedBy: user,
      fileName,
      source,
      system,
    });

    this.logger.debug(`File Uploaded to ${fileKey}`);
    return document;
  }

  async createFromBuffer(
    filePath: string,
    fileName: string,
    file: Buffer,
    mimeType: string,
    fileSize: number,
    user: User,
    source = DOCUMENT_SOURCE.ALC,
    system: DOCUMENT_SYSTEM,
  ) {
    const fileKey = `${filePath}/${v4()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: file,
      ACL: 'bucket-owner-full-control',
      Tagging: DEFAULT_S3_TAGS,
      ContentType: mimeType,
      ContentLength: fileSize,
    });
    await this.dataStore.send(command);
    const document = await this.createDocumentRecord({
      fileKey,
      fileSize,
      mimeType,
      uploadedBy: user,
      fileName,
      source,
      system,
    });

    this.logger.debug(`File Uploaded to ${fileKey}`);
    return document;
  }

  async softRemove(document: Document) {
    await this.documentRepository.softRemove(document);
  }

  async softRemoveMany(documents: Document[]) {
    await this.documentRepository.softRemove(documents);
  }

  async getUploadUrl(filePath: string) {
    const fileKey = `${filePath}/${v4()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ACL: 'bucket-owner-full-control',
      Tagging: DEFAULT_S3_TAGS,
    });

    return {
      uploadUrl: await getSignedUrl(this.dataStore, command, {
        expiresIn: this.documentTimeout,
      }),
      fileKey: fileKey,
    };
  }

  getDownloadUrl(document: Document, openInline = false) {
    const command = new GetObjectCommand({
      Bucket: this.config.get('STORAGE.BUCKET'),
      Key: document.fileKey,
      ResponseContentDisposition: `${
        openInline ? 'inline' : 'attachment'
      }; filename="${document.fileName}"`,
      ResponseContentType: document.mimeType,
    });
    return getSignedUrl(this.dataStore, command, {
      expiresIn: this.documentTimeout,
    });
  }

  async getDownloadUrlAndFileNameByUuid(uuid: string, openInline = false): Promise<{ url: string; fileName: string }> {
    const document = await this.getDocument(uuid);

    return { url: await this.getDownloadUrl(document, openInline), fileName: document.fileName };
  }

  async getPublicDownloadUrlAndFileNameByUuid(
    uuid: string,
    openInline = false,
  ): Promise<{ url: string; fileName: string }> {
    const document = await this.getDocument(uuid);

    const fileDocuments = await this.dataSource.query(
      `
      select
        ad.visibility_flags
      from
        alcs.application_document ad 
      where 
        ad.document_uuid = $1
      union
      select
        noid.visibility_flags
      from
        alcs.notice_of_intent_document noid
      where
        noid.document_uuid = $1
      union
      select
        nd2.visibility_flags
      from
        alcs.notification_document nd2
      where 
        nd2.document_uuid = $1
      `,
      [uuid],
    );

    const decisionDocuments = await this.dataSource.query(
      `
      select
        add.uuid
      from
        alcs.application_decision_document add 
        join alcs.application_decision ad on ad.uuid = add.decision_uuid
      where 
        add.document_uuid = $1
        and ad.is_draft = false
      union
      select
        noidd.uuid
      from
        alcs.notice_of_intent_decision_document noidd
        join alcs.notice_of_intent_decision noid on noid.uuid = noidd.decision_uuid
      where
        noidd.document_uuid = $1
        and noid.is_draft = false
      `,
      [uuid],
    );

    // Unlikely a document is attached to more than one file document, but if it
    // is, as long as any of them have made the doc public, show it
    if (
      !fileDocuments.some((doc) => doc.visibility_flags.includes(VISIBILITY_FLAG.PUBLIC)) &&
      decisionDocuments.length === 0
    ) {
      throw new ServiceNotFoundException('Failed to find document');
    }

    return { url: await this.getDownloadUrl(document, openInline), fileName: document.fileName };
  }

  async createDocumentRecord(data: CreateDocumentDto) {
    const command = new GetObjectCommand({
      Bucket: this.config.get('STORAGE.BUCKET'),
      Key: data.fileKey,
      ResponseContentDisposition: `attachment; filename="${data.fileName}"`,
    });

    const fileUrl = await getSignedUrl(this.dataStore, command, {
      expiresIn: this.documentTimeout,
    });

    const isInfected = await this.clamAvService.scanFile(fileUrl);

    if (isInfected === null || isInfected === undefined) {
      await this.deleteDocument(data.fileKey);
      this.logger.warn(`Deleted unscanned file ${data.fileKey}`);
      throw new BaseServiceException(
        'Virus scan failed, cannot determine if infected, upload blocked',
        undefined,
        'VirusScanFailed',
      );
    }

    if (isInfected) {
      await this.deleteDocument(data.fileKey);
      this.logger.warn(`Deleted malicious file ${data.fileKey}`);
      throw new ServiceValidationException('File may contain malicious data, upload blocked', 'VirusDetected');
    }

    return this.documentRepository.save(
      new Document({
        mimeType: data.mimeType,
        fileKey: data.fileKey,
        fileName: data.fileName,
        fileSize: data.fileSize,
        source: data.source,
        system: data.system,
        uploadedBy: data.uploadedBy,
        tags: DEFAULT_DB_TAGS,
      }),
    );
  }

  async getDocument(uuid: string) {
    return this.documentRepository.findOneOrFail({
      where: {
        uuid,
      },
    });
  }

  private async deleteDocument(fileKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.config.get('STORAGE.BUCKET'),
      Key: fileKey,
    });
    await this.dataStore.send(command);
  }

  async update(
    document: Document,
    updates: { fileName: string; source: DOCUMENT_SOURCE },
  ) {
    document.fileName = updates.fileName;
    document.source = updates.source;
    await this.documentRepository.save(document);
  }
}
