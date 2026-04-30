import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserService } from '../../services/user/user.service';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MentionTextareaComponent } from './mention-textarea.component';

describe('MentionTextareaComponent', () => {
  let component: MentionTextareaComponent;
  let fixture: ComponentFixture<MentionTextareaComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();

    await TestBed.configureTestingModule({
      declarations: [MentionTextareaComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MentionTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
