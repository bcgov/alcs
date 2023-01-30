import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandUseComponent } from './land-use.component';

describe('LandUseComponent', () => {
  let component: LandUseComponent;
  let fixture: ComponentFixture<LandUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandUseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
