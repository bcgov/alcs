import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionV2Component } from './decision-v2.component';

describe('DecisionV2Component', () => {
  let component: DecisionV2Component;
  let fixture: ComponentFixture<DecisionV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionV2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
