import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionComponentsComponent } from './decision-components.component';

describe('DecisionComponentsComponent', () => {
  let component: DecisionComponentsComponent;
  let fixture: ComponentFixture<DecisionComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionComponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
