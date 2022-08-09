import { Test, TestingModule } from '@nestjs/testing';
import { CommentMentionService } from './comment-mention.service';

describe('CommentMentionService', () => {
  let service: CommentMentionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentMentionService],
    }).compile();

    service = module.get<CommentMentionService>(CommentMentionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
