import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../toast/toast.service';
import {
  CreatePlanningReviewMeetingDto,
  PlanningReviewMeetingDto,
  PlanningReviewMeetingTypeDto,
  UpdatePlanningReviewMeetingDto,
} from './planning-review-meeting.dto';
import { PlanningReviewMeetingService } from './planning-review-meeting.service';

describe('PlanningReviewMeetingService', () => {
  let service: PlanningReviewMeetingService;
  let httpClient: DeepMocked<HttpClient>;
  let mockToastService: DeepMocked<ToastService>;
  const apiUrl = `${environment.apiUrl}/planning-review-meeting`;

  beforeEach(() => {
    mockToastService = createMock();
    httpClient = createMock();

    TestBed.configureTestingModule({
      providers: [
        PlanningReviewMeetingService,
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: HttpClient,
          useValue: httpClient,
        },
      ],
    });
    service = TestBed.inject(PlanningReviewMeetingService);
  });

  it('should list meetings by planning review', async () => {
    const planningReviewUuid = 'test-uuid';
    const mockMeetings = [{ uuid: 'meeting-uuid-1' }, { uuid: 'meeting-uuid-2' }] as PlanningReviewMeetingDto[];

    httpClient.get.mockReturnValue(of(mockMeetings));

    const res = await service.listByPlanningReview(planningReviewUuid);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(res?.length).toEqual(2);
  });

  it('should create a new meeting', async () => {
    const createDto = {
      planningReviewUuid: 'test-uuid',
    } as CreatePlanningReviewMeetingDto;
    const mockMeeting = {
      uuid: 'new-meeting-uuid',
    } as PlanningReviewMeetingDto;

    httpClient.post.mockReturnValue(of(mockMeeting));

    const res = await service.create(createDto);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockMeeting);
  });

  it('should show a toast message if create fails', async () => {
    httpClient.post.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const createDto = {
      planningReviewUuid: 'test-uuid',
    } as CreatePlanningReviewMeetingDto;

    await service.create(createDto);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should fetch meeting types', async () => {
    const mockTypes = [{ code: 'type-code-1' }, { code: 'type-code-2' }] as PlanningReviewMeetingTypeDto[];
    httpClient.get.mockReturnValue(of(mockTypes));

    const res = await service.fetchTypes();

    expect(res).toEqual(mockTypes);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should show a toast message if fetch meeting types fails', async () => {
    httpClient.get.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    await service.fetchTypes();

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should update a meeting', async () => {
    const uuid = 'meeting-uuid';
    const updateDto: UpdatePlanningReviewMeetingDto = {
      date: 5,
      typeCode: 'Cats',
    };
    const mockMeeting = {
      uuid: 'meeting-uuid',
    } as PlanningReviewMeetingDto;
    httpClient.patch.mockReturnValue(of(mockMeeting));

    const res = await service.update(uuid, updateDto);

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockMeeting);
  });

  it('should show a toast message if update meeting fails', async () => {
    httpClient.patch.mockReturnValue(
      throwError(() => {
        new Error('');
      }),
    );

    const updateDto: UpdatePlanningReviewMeetingDto = {
      date: 5,
      typeCode: 'Cats',
    };

    await service.update('meeting-uuid', updateDto);

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
    expect(mockToastService.showErrorToast).toHaveBeenCalledTimes(1);
  });

  it('should delete a meeting', async () => {
    const uuid = 'meeting-uuid';
    const mockResponse = { success: true };
    httpClient.delete.mockReturnValue(of(mockResponse));

    const res = await service.delete(uuid);

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
    expect(res).toEqual(mockResponse);
  });
});
