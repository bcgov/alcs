import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarCircleComponent } from './avatar-circle.component';

describe('AvatarCircleComponent', () => {
  let component: AvatarCircleComponent;
  let fixture: ComponentFixture<AvatarCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvatarCircleComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
