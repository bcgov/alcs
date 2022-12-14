import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MultipartFile } from '@fastify/multipart';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CONFIG_TOKEN, IConfig } from '../common/config/config.module';
import { User } from '../user/user.entity';
import { CreateDocumentDto } from './document.dto';
import { Document } from './document.entity';

const DEFAULT_DB_TAGS = ['ORCS Classification: 85100-20'];
const DEFAULT_S3_TAGS = 'ORCS-Classification=85100-20';

@Injectable()
export class DocumentService {
  private dataStore: S3Client;
  private logger = new Logger(DocumentService.name);
  private bucket = this.config.get<string>('STORAGE.BUCKET');
  private documentTimeout = this.config.get<number>('ALCS.DOCUMENT_TIMEOUT');

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

  async create(filePath: string, file: MultipartFile, user: User) {
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
      mimeType: file.mimetype,
      uploadedBy: user,
      fileName: file.filename,
      source: 'ALCS',
    });

    this.logger.debug(`File Uploaded to ${fileKey}`);
    return document;
  }

  async softRemove(document: Document) {
    await this.documentRepository.softRemove(document);
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

  //One time function used to apply default tags to existing documents
  async applyDefaultTags() {
    const documents = await this.documentRepository.find();
    console.warn(
      `Applying default document tags to ${documents.length} Documents`,
    );
    for (const document of documents) {
      document.tags = DEFAULT_DB_TAGS;
      const command = new PutObjectTaggingCommand({
        Bucket: this.config.get('STORAGE.BUCKET'),
        Key: document.fileKey,
        Tagging: {
          TagSet: [
            {
              Key: 'ORCS-Classification',
              Value: '85100-20',
            },
          ],
        },
      });
      await this.dataStore.send(command);
      await this.documentRepository.save(document);
    }
    console.warn(`${documents.length} Documents tagged successfully`);
  }

  async createDocumentRecord(data: CreateDocumentDto) {
    return this.documentRepository.save(
      new Document({
        mimeType: data.mimeType,
        fileKey: data.fileKey,
        fileName: data.fileName,
        source: data.source,
        uploadedBy: data.uploadedBy,
        tags: DEFAULT_DB_TAGS,
      }),
    );
  }
}
