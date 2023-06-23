import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionCodesDto } from '../../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { NaruInputComponent } from './naru-input.component';

describe('NaruInputComponent', () => {
  let component: NaruInputComponent;
  let fixture: ComponentFixture<NaruInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NaruInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NaruInputComponent);
    component = fixture.componentInstance;
    component.codes = {} as DecisionCodesDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
