import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { UserService } from '../user/user.service';
import { Comment } from './comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private applicationService: ApplicationService,
    private userService: UserService,
    private cls: ClsService,
  ) {}

  async fetchComments(fileNumber: string) {
    const application = await this.applicationService.get(fileNumber);
    return this.commentRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
      relations: ['madeBy'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async get(commentUuid: string) {
    return this.commentRepository.findOne({
      where: {
        uuid: commentUuid,
      },
      relations: ['madeBy'],
    });
  }

  async create(fileNumber: string, commentBody: string) {
    const application = await this.applicationService.get(fileNumber);
    if (!application) {
      throw new NotFoundException('Unable to find application');
    }

    const userEmail = this.cls.get('userEmail');
    const user = await this.userService.getUser(userEmail);

    const comment = new Comment({
      body: commentBody,
      application,
      madeBy: user,
    });
    return this.commentRepository.save(comment);
  }

  async delete(uuid: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
    });

    await this.commentRepository.softRemove([comment]);
    return;
  }

  async update(uuid: string, body: string) {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
    });

    comment.edited = true;
    comment.body = body;

    await this.commentRepository.save(comment);
    return;
  }
}
