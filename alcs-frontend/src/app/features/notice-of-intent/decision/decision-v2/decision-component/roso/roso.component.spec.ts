import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';

import { RosoComponent } from './roso.component';

describe('RosoComponent', () => {
  let component: RosoComponent;
  let fixture: ComponentFixture<RosoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RosoComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoComponent);
    component = fixture.componentInstance;
    component.component = {} as NoticeOfIntentDecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
