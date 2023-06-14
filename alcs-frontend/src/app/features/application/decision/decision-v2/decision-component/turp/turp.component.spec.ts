import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { TurpComponent } from './turp.component';

describe('TurpComponent', () => {
  let component: TurpComponent;
  let fixture: ComponentFixture<TurpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TurpComponent);
    component = fixture.componentInstance;
    component.component = {} as DecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
