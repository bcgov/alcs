import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_BOARDS,
} from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CommentMentionDto } from './mention/comment-mention.dto';
import { CommentMention } from './mention/comment-mention.entity';

@Controller('comment')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
export class CommentController {
  constructor(
    private commentService: CommentService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get('/:cardUuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('cardUuid') cardUuid, @Req() req): Promise<CommentDto[]> {
    const comments = await this.commentService.fetch(cardUuid);
    return this.mapToDto(comments, req.user.entity.uuid);
  }

  @Post()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async create(
    @Body() comment: CreateCommentDto,
    @Req() req,
  ): Promise<CommentDto> {
    const mappedMentions = await this.mapMentions(comment);
    const newComment = await this.commentService.create(
      comment.cardUuid,
      comment.body,
      req.user.entity,
      mappedMentions,
    );

    return this.autoMapper.map(newComment, Comment, CommentDto);
  }

  @Patch()
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async update(
    @Body() comment: UpdateCommentDto,
    @Req() req,
  ): Promise<CommentDto> {
    const existingComment = await this.commentService.get(comment.uuid);

    if (!existingComment) {
      throw new NotFoundException(`Comment ${comment.uuid} not found`);
    }

    if (existingComment.author.uuid === req.user.entity.uuid) {
      const updatedComment = await this.commentService.update(
        comment.uuid,
        comment.body,
        await this.mapMentions(comment),
      );
      return this.autoMapper.map(updatedComment, Comment, CommentDto);
    } else {
      throw new ForbiddenException('Unable to delete others comments');
    }
  }

  @Delete('/:id')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async softDelete(@Param('id') id: string, @Req() req): Promise<void> {
    const comment = await this.commentService.get(id);

    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    if (comment.author.uuid === req.user.entity.uuid) {
      await this.commentService.delete(id);
    } else {
      throw new ForbiddenException('Unable to delete others comments');
    }
  }

  private async mapToDto(
    comments: Comment[],
    userUuid: string,
  ): Promise<CommentDto[]> {
    return comments.map((comment) => ({
      ...this.autoMapper.map(comment, Comment, CommentDto),
      isEditable: comment.author.uuid === userUuid,
    }));
  }

  private async mapMentions(comment: CreateCommentDto | UpdateCommentDto) {
    return comment.mentions && comment.mentions.length > 0
      ? await this.autoMapper.mapArrayAsync(
          comment.mentions,
          CommentMentionDto,
          CommentMention,
        )
      : [];
  }
}
