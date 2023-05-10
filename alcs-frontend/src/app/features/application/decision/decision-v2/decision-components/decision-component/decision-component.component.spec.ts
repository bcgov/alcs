import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionComponentComponent } from './decision-component.component';

describe('DecisionComponentComponent', () => {
  let component: DecisionComponentComponent;
  let fixture: ComponentFixture<DecisionComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
