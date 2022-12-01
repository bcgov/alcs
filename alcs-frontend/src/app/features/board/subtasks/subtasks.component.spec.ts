import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { AssigneeDto, UserDto } from '../../../services/user/user.dto';
import { UserService } from '../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SubtasksComponent } from './subtasks.component';

describe('SubtasksComponent', () => {
  let component: SubtasksComponent;
  let fixture: ComponentFixture<SubtasksComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();
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
      imports: [HttpClientTestingModule, MatSnackBarModule, MatMenuModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtasksComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
