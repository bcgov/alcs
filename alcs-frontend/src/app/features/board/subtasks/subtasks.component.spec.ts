import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { AssigneeDto, UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SubtasksComponent } from './subtasks.component';

describe('SubtasksComponent', () => {
  let component: SubtasksComponent;
  let fixture: ComponentFixture<SubtasksComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj<UserService>('UserService', ['fetchAssignableUsers']);
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CardSubtaskService,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
      declarations: [SubtasksComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtasksComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
