import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../services/public/public.service';

import { PublicLfngReviewComponent } from './lfng-review.component';

describe('PublicLfngReviewComponent', () => {
  let component: PublicLfngReviewComponent;
  let fixture: ComponentFixture<PublicLfngReviewComponent>;

  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    mockPublicService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
      declarations: [PublicLfngReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLfngReviewComponent);
    component = fixture.componentInstance;
    component.applicationDocuments = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
