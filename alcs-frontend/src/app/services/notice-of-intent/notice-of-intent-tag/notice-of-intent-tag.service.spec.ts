import { TestBed } from '@angular/core/testing';

import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';

describe('NoticeOfIntentTagService', () => {
  let service: NoticeOfIntentTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoticeOfIntentTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
