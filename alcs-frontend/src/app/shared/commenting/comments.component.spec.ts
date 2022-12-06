import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { CommentService } from '../../services/comment/comment.service';
import { ToastService } from '../../services/toast/toast.service';
import { AssigneeDto, UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { CommentsComponent } from './comments.component';

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();
    mockUserService.$assignableUsers = new BehaviorSubject<AssigneeDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CommentService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      declarations: [CommentsComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    component.comment = {
      uuid: 'fake-uuid',
      body: 'fake-body',
      author: 'fake-author',
      edited: false,
      isEditable: false,
      createdAt: Date.now(),
      mentions: [],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
