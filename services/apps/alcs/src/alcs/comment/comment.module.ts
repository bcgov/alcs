import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CardModule } from '../card/card.module';
import { CommentProfile } from '../../common/automapper/comment.automapper.profile';
import { NotificationModule } from '../notification/notification.module';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CommentMention } from './mention/comment-mention.entity';
import { CommentMentionService } from './mention/comment-mention.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentMention]),
    ApplicationModule,
    NotificationModule,
    CardModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentProfile, CommentMentionService],
})
export class CommentModule {}
