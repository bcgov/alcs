import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock } from '@golevelup/nestjs-testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { CommentProfile } from '../common/automapper/comment.automapper.profile';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

describe('CommentController', () => {
  let controller: CommentController;
  let mockCommentService;

  let comment;
  let user;

  let request;

  beforeEach(async () => {
    mockCommentService = createMock<CommentService>();

    user = {
      name: 'Bruce Wayne',
      email: 'fake-email',
    };

    request = {
      user,
    };

    comment = new Comment({
      body: 'body',
      madeBy: user as any,
      createdAt: new Date(),
      applicationUuid: 'file-number',
      edited: false,
      uuid: 'fake-uuid',
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CommentProfile,
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [CommentController],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should correctly map fetched the madeBy and editable fields', async () => {
    mockCommentService.fetchComments.mockResolvedValue([comment]);

    const comments = await controller.get('file-number', request);
    expect(comments.length).toEqual(1);
    expect(comments[0].madeBy).toEqual(user.name);
    expect(comments[0].isEditable).toEqual(true);
  });

  it('should pass the new comment to the service', async () => {
    mockCommentService.create.mockResolvedValue(comment);

    await controller.create({
      fileNumber: 'file-number',
      body: 'comment-body',
    });

    expect(mockCommentService.create).toHaveBeenCalled();
    const passedData = mockCommentService.create.mock.calls[0];
    expect(passedData[0]).toEqual('file-number');
    expect(passedData[1]).toEqual('comment-body');
  });

  it('should update the comment when it exists and its the same user', async () => {
    mockCommentService.get.mockResolvedValue(comment);
    mockCommentService.update.mockResolvedValue(comment);

    await controller.update(
      {
        body: 'new-body',
        uuid: 'uuid',
      },
      request,
    );

    expect(mockCommentService.update).toHaveBeenCalled();
    const passedData = mockCommentService.update.mock.calls[0];
    expect(passedData[1]).toEqual('new-body');
    expect(passedData[0]).toEqual('uuid');
  });

  it("should throw an exception when trying to update a comment that doesn't exist", async () => {
    mockCommentService.get.mockResolvedValue(undefined);
    mockCommentService.update.mockResolvedValue(comment);

    await expect(
      controller.update(
        {
          body: 'new-body',
          uuid: 'uuid',
        },
        request,
      ),
    ).rejects.toMatchObject(new NotFoundException(`Comment uuid not found`));

    expect(mockCommentService.update).not.toHaveBeenCalled();
  });

  it('should throw a forbidden exception when trying to update another users comment', async () => {
    mockCommentService.get.mockResolvedValue(comment);
    mockCommentService.update.mockResolvedValue(comment);
    request.user = {
      ...user,
      email: 'a different email',
    };

    await expect(
      controller.update(
        {
          body: 'new-body',
          uuid: 'uuid',
        },
        request,
      ),
    ).rejects.toMatchObject(
      new ForbiddenException(`Unable to delete others comments`),
    );
    expect(mockCommentService.update).not.toHaveBeenCalled();
  });

  it('should delete the comment when it exists and its the same user', async () => {
    mockCommentService.get.mockResolvedValue(comment);
    mockCommentService.delete.mockResolvedValue(comment);

    await controller.softDelete('uuid', request);

    expect(mockCommentService.delete).toHaveBeenCalled();
    const passedData = mockCommentService.delete.mock.calls[0];
    expect(passedData[0]).toEqual('uuid');
  });

  it("should throw an exception when trying to delete a comment that doesn't exist", async () => {
    mockCommentService.get.mockResolvedValue(undefined);
    mockCommentService.delete.mockResolvedValue(comment);

    await expect(controller.softDelete('uuid', request)).rejects.toMatchObject(
      new NotFoundException(`Comment uuid not found`),
    );

    expect(mockCommentService.delete).not.toHaveBeenCalled();
  });

  it('should throw a forbidden exception when trying to update another users comment', async () => {
    mockCommentService.get.mockResolvedValue(comment);
    mockCommentService.delete.mockResolvedValue(comment);
    request.user = {
      ...user,
      email: 'a different email',
    };

    await expect(controller.softDelete('uuid', request)).rejects.toMatchObject(
      new ForbiddenException(`Unable to delete others comments`),
    );
    expect(mockCommentService.delete).not.toHaveBeenCalled();
  });
});
