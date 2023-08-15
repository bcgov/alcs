import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MultipartFile } from '@fastify/multipart';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { User } from '../user/user.entity';
import {
  CreateDocumentDto,
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from './document.dto';
import { Document } from './document.entity';

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
      fileKey: fileKey,
      fileSize: fileSize,
      mimeType: mimeType,
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
    });
    return getSignedUrl(this.dataStore, command, {
      expiresIn: this.documentTimeout,
    });
  }

  async createDocumentRecord(data: CreateDocumentDto) {
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

  async update(
    document: Document,
    updates: { fileName: string; source: DOCUMENT_SOURCE },
  ) {
    document.fileName = updates.fileName;
    document.source = updates.source;
    await this.documentRepository.save(document);
  }
}
