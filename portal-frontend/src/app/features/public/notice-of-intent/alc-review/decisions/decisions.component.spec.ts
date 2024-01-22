import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock } from '@golevelup/ts-jest';
import { NoticeOfIntentDecisionService } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.service';

import { PublicDecisionsComponent } from './decisions.component';

describe('PublicDecisionsComponent', () => {
  let component: PublicDecisionsComponent;
  let fixture: ComponentFixture<PublicDecisionsComponent>;
  let mockDecisionService: NoticeOfIntentDecisionService;

  beforeEach(async () => {
    mockDecisionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [PublicDecisionsComponent],
      providers: [
        {
          provide: NoticeOfIntentDecisionService,
          useValue: mockDecisionService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicDecisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
