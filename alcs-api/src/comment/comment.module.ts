import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CommentProfile } from '../common/automapper/comment.automapper.profile';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), ApplicationModule],
  controllers: [CommentController],
  providers: [CommentService, CommentProfile],
})
export class CommentModule {}
