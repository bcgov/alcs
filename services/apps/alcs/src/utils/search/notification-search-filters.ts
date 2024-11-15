import { Brackets, Repository } from 'typeorm';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { Notification } from '../../alcs/notification/notification.entity';
import { InboxRequestDto } from '../../portal/inbox/inbox.dto';
import { NotificationParcel } from '../../portal/notification-submission/notification-parcel/notification-parcel.entity';
import { NotificationSubmission } from '../../portal/notification-submission/notification-submission.entity';
import { NotificationTransferee } from '../../portal/notification-submission/notification-transferee/notification-transferee.entity';
import { SearchRequestDto } from '../../portal/public/search/public-search.dto';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../search-helper';

export const NOTIFICATION_SEARCH_FILTERS = {
  addFileNumberResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    notificationRepository: Repository<Notification>,
  ) => {
    return notificationRepository.find({
      where: {
        fileNumber: searchDto.fileNumber,
      },
      select: {
        fileNumber: true,
      },
    });
  },

  addPortalStatusResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    notificationSubmissionRepository: Repository<NotificationSubmission>,
  ) => {
    return notificationSubmissionRepository
      .createQueryBuilder('notiSub')
      .select('notiSub.fileNumber')
      .where(
        "alcs.get_current_status_for_notification_submission_by_uuid(notiSub.uuid) ->> 'status_type_code' IN(:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
  },
  addTagsResults: () => {
    // add tags filter when it's implemented
    return Promise.all([]);
  },
  addTagCategoryResults: () => {
    // add tag category filter when it's implemented
    return Promise.all([]);
  },
  addNameResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    notificationSubRepository: Repository<NotificationSubmission>,
  ) => {
    const formattedSearchString = formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);
    return notificationSubRepository
      .createQueryBuilder('notiSub')
      .select('notiSub.fileNumber')
      .leftJoin(
        NotificationTransferee,
        'notification_transferee',
        'notification_transferee.notification_submission_uuid = notiSub.uuid',
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where(
              "LOWER(notification_transferee.first_name || ' ' || notification_transferee.last_name) LIKE ANY (:names)",
              {
                names: formattedSearchString,
              },
            )
            .orWhere('LOWER(notification_transferee.first_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            })
            .orWhere('LOWER(notification_transferee.last_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            })
            .orWhere('LOWER(notification_transferee.organization_name) LIKE ANY (:names)', {
              names: formattedSearchString,
            }),
        ),
      )
      .getMany();
  },
  addGovernmentResults: async (
    searchDto: SearchRequestDto,
    notificationRepository: Repository<Notification>,
    governmentRepository: Repository<LocalGovernment>,
  ) => {
    const government = await governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    return notificationRepository.find({
      where: {
        localGovernmentUuid: government.uuid,
      },
      select: {
        fileNumber: true,
      },
    });
  },
  addParcelResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    notificationSubRepository: Repository<NotificationSubmission>,
  ) => {
    let query = notificationSubRepository
      .createQueryBuilder('notiSub')
      .select('notiSub.fileNumber')
      .leftJoin(NotificationParcel, 'parcel', 'parcel.notification_submission_uuid = notiSub.uuid');

    if (searchDto.pid) {
      query = query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query = query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }

    return query.getMany();
  },
  addFileTypeResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    notificationRepository: Repository<Notification>,
  ) => {
    return notificationRepository.find({
      select: {
        fileNumber: true,
      },
    });
  },
};
