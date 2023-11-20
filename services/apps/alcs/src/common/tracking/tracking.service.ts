import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { FileViewed } from './file-viewed.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(FileViewed)
    private repository: Repository<FileViewed>,
  ) {}

  async trackView(user: User, fileNumber: string) {
    const view = new FileViewed({
      userUuid: user.uuid,
      fileNumber,
    });
    await this.repository.insert(view);
  }
}
