import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';

import { PofoComponent } from './pofo.component';

describe('PofoComponent', () => {
  let component: PofoComponent;
  let fixture: ComponentFixture<PofoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PofoComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PofoComponent);
    component = fixture.componentInstance;
    component.component = {} as NoticeOfIntentDecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
