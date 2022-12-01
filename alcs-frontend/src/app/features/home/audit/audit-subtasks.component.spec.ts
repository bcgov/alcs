import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { HomeService } from '../../../services/home/home.service';
import { AssigneeDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';

import { AuditSubtasksComponent } from './audit-subtasks.component';

describe('AuditComponent', () => {
  let component: AuditSubtasksComponent;
  let fixture: ComponentFixture<AuditSubtasksComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: CardSubtaskService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        { provide: HomeService, useValue: {} },
      ],
      declarations: [AuditSubtasksComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditSubtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
