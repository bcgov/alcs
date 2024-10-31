import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentTagController } from './notice-of-intent-tag.controller';
import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';
import { DeepMocked } from '@golevelup/nestjs-testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';

describe('NoticeOfIntentTagController', () => {
  let controller: NoticeOfIntentTagController;
  let tagService: DeepMocked<NoticeOfIntentTagService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentTagController],
      providers: [
        { provide: NoticeOfIntentTagService, useValue: tagService },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentTagController>(NoticeOfIntentTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
