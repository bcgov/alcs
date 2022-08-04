import { createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { Repository } from 'typeorm';
import { ApplicationService } from '../application/application.service';
import { UserService } from '../user/user.service';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let mockApplicationService;
  let mockCommentRepository;
  let mockUserService;
  let mockClsService;

  let comment;

  beforeEach(async () => {
    mockCommentRepository = createMock<Repository<Comment>>();
    mockApplicationService = createMock<ApplicationService>();
    mockUserService = createMock<UserService>();
    mockClsService = createMock<ClsService>();

    comment = new Comment({
      body: 'body',
      madeBy: {
        uuid: '',
        email: 'fake-email',
        name: 'fake-name',
      } as any,
      createdAt: new Date(),
      applicationUuid: 'file-number',
      edited: false,
      uuid: '',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched comments', async () => {
    mockApplicationService.get.mockResolvedValue({});
    mockCommentRepository.find.mockResolvedValue([comment]);

    const comments = await service.fetchComments('file-number');

    expect(mockApplicationService.get).toHaveBeenCalled();
    expect(mockCommentRepository.find).toHaveBeenCalled();
    expect(comments.length).toEqual(1);
    expect(comments[0]).toEqual(comment);
  });

  it('should return the fetched comment', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);

    const loadedComment = await service.get('comment-uuid');

    expect(mockCommentRepository.findOne).toHaveBeenCalled();
    expect(loadedComment).toEqual(comment);
  });

  it('should save the new comment with the user and application', async () => {
    const fakeUser = {
      uuid: 'fake-user',
    };
    const fakeApplication = {
      uuid: 'fake-application',
    };
    mockApplicationService.get.mockResolvedValue(fakeApplication);
    mockUserService.getUser.mockResolvedValue(fakeUser);
    mockCommentRepository.save.mockResolvedValue({});

    await service.create('file-number', 'new-comment');

    expect(mockCommentRepository.save).toHaveBeenCalled();
    const savedData = mockCommentRepository.save.mock.calls[0][0];
    expect(savedData.madeBy).toEqual(fakeUser);
    expect(savedData.application).toEqual(fakeApplication);
    expect(savedData.body).toEqual('new-comment');
  });

  it('throw an exception when saving a comment to a non-existing application', async () => {
    mockApplicationService.get.mockResolvedValue(undefined);

    await expect(
      service.create('file-number', 'new-comment'),
    ).rejects.toMatchObject(new Error(`Unable to find application`));
  });

  it('should call soft remove when deleting', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);
    mockCommentRepository.softRemove.mockResolvedValue({});

    await service.delete('comment-uuid');

    expect(mockCommentRepository.findOne).toHaveBeenCalled();
    expect(mockCommentRepository.softRemove).toHaveBeenCalled();
  });

  it('should set the edited flag when editing', async () => {
    mockCommentRepository.findOne.mockResolvedValue(comment);
    mockCommentRepository.save.mockResolvedValue({});

    await service.update('comment-uuid', 'new-body');

    expect(mockCommentRepository.findOne).toHaveBeenCalled();
    expect(mockCommentRepository.save).toHaveBeenCalled();
    const savedData = mockCommentRepository.save.mock.calls[0][0];
    expect(savedData.body).toEqual('new-body');
    expect(savedData.edited).toBeTruthy();
  });
});
