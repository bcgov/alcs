import { MultipartFile } from '@fastify/multipart';
import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';
import { User } from '../../user/user.entity';

@Injectable()
export class DocumentService {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  async create(filePath: string, file: MultipartFile, user: User) {
    //TODO: Call out to ALCS
    return v4();
  }

  async delete(uuid: string) {
    //TODO: Call out to ALCS
  }

  async getDownloadUrl(uuid: string, openInline = false) {
    //TODO: Call out to ALCS
    return '';
  }
}
