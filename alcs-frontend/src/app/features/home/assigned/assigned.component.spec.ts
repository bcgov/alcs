import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from '../../../services/application/application.service';
import { HomeService } from '../../../services/home/home.service';

import { AssignedComponent } from './assigned.component';

describe('AssignedComponent', () => {
  let component: AssignedComponent;
  let fixture: ComponentFixture<AssignedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            setup: jasmine.createSpy(),
            $applicationStatuses: new EventEmitter(),
          },
        },
        { provide: HomeService, useValue: {} },
      ],
      declarations: [AssignedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
