import { TestBed } from '@angular/core/testing';

import { NoticeOfIntentParcelService } from './notice-of-intent-parcel.service';

describe('NoticeOfIntentParcelService', () => {
  let service: NoticeOfIntentParcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoticeOfIntentParcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
