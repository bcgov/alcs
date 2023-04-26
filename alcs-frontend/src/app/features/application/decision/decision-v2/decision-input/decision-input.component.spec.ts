import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionInputComponent } from './decision-input.component';

describe('DecisionInputComponent', () => {
  let component: DecisionInputComponent;
  let fixture: ComponentFixture<DecisionInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
