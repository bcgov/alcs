import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { ExpiryDateComponent } from './expiry-date.component';

describe('ExpiryDateComponent', () => {
  let component: ExpiryDateComponent;
  let fixture: ComponentFixture<ExpiryDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpiryDateComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiryDateComponent);
    component = fixture.componentInstance;
    component.component = {} as ApplicationDecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
