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
import { UserRoles } from '../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE } from '../common/enum';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Controller('comment')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
export class CommentController {
  constructor(
    private commentService: CommentService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get('/:fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async get(
    @Param('fileNumber') fileNumber,
    @Req() req,
  ): Promise<CommentDto[]> {
    const comments = await this.commentService.fetchComments(fileNumber);
    return this.mapToDto(comments, req.user.entity.uuid);
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async create(
    @Body() comment: CreateCommentDto,
    @Req() req,
  ): Promise<CommentDto> {
    const newComment = await this.commentService.create(
      comment.fileNumber,
      comment.body,
      req.user.entity,
    );
    return this.autoMapper.map(newComment, Comment, CommentDto);
  }

  @Patch()
  @UserRoles(...ANY_AUTH_ROLE)
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
      );
      return this.autoMapper.map(updatedComment, Comment, CommentDto);
    } else {
      throw new ForbiddenException('Unable to delete others comments');
    }
  }

  @Delete('/:id')
  @UserRoles(...ANY_AUTH_ROLE)
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
}
