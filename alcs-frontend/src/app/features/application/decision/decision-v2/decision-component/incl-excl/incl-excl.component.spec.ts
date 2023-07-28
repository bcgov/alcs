import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

import { InclExclComponent } from './incl-excl.component';

describe('NaruComponent', () => {
  let component: InclExclComponent;
  let fixture: ComponentFixture<InclExclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InclExclComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InclExclComponent);
    component = fixture.componentInstance;
    component.component = {} as DecisionComponentDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
