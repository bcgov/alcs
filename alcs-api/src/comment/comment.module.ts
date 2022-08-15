import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CommentProfile } from '../common/automapper/comment.automapper.profile';
import { EmailModule } from '../providers/email/email.module';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CommentMention } from './mention/comment-mention.entity';
import { CommentMentionService } from './mention/comment-mention.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentMention]),
    ApplicationModule,
    EmailModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentProfile, CommentMentionService],
})
export class CommentModule {}
