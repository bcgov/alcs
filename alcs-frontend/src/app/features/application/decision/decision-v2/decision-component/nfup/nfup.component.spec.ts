import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { NfupComponent } from './nfup.component';

describe('NfupComponent', () => {
  let component: NfupComponent;
  let fixture: ComponentFixture<NfupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NfupComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NfupComponent);
    component = fixture.componentInstance;
    component.component = {} as ApplicationDecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
