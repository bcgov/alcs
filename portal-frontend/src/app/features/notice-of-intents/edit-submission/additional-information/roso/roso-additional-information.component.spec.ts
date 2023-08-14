import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RosoAdditionalInformationComponent } from './roso-additional-information.component';

describe('RosoComponent', () => {
  let component: RosoAdditionalInformationComponent;
  let fixture: ComponentFixture<RosoAdditionalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RosoAdditionalInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoAdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
