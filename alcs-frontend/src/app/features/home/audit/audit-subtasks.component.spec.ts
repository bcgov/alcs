import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { HomeService } from '../../../services/home/home.service';
import { UserService } from '../../../services/user/user.service';

import { AuditSubtasksComponent } from './audit-subtasks.component';

describe('AuditComponent', () => {
  let component: AuditSubtasksComponent;
  let fixture: ComponentFixture<AuditSubtasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          useValue: {
            setup: jasmine.createSpy(),
            $cardStatuses: new EventEmitter(),
          },
        },
        {
          provide: CardSubtaskService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {
            $users: new EventEmitter(),
            fetchUsers: jasmine.createSpy(),
          },
        },
        { provide: HomeService, useValue: {} },
      ],
      declarations: [AuditSubtasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditSubtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
