import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommentService } from '../../services/comment/comment.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { CommentsComponent } from './comments.component';

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;
  let mockUserService: DeepMocked<UserService>;
  let mockCommentService: DeepMocked<CommentService>;

  beforeEach(async () => {
    mockCommentService = createMock();
    mockUserService = createMock();

    await TestBed.configureTestingModule({
      declarations: [CommentsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
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

    mockCommentService.fetchComments.mockResolvedValue([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
