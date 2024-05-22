import { Brackets, Repository } from 'typeorm';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { InboxRequestDto } from '../../portal/inbox/inbox.dto';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { SearchRequestDto } from '../../portal/public/search/public-search.dto';
import { formatStringToPostgresSearchStringArrayWithWildCard } from '../search-helper';

export const NOI_SEARCH_FILTERS = {
  addFileNumberResults: (
    searchDto: SearchRequestDto,
    noiRepository: Repository<NoticeOfIntent>,
  ) => {
    return noiRepository.find({
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
    noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
  ) => {
    return noiSubmissionRepository
      .createQueryBuilder('noiSubs')
      .select('noiSubs.fileNumber')
      .where(
        "alcs.get_current_status_for_notice_of_intent_submission_by_uuid(noiSubs.uuid) ->> 'status_type_code' IN(:...statusCodes)",
        {
          statusCodes: searchDto.portalStatusCodes,
        },
      )
      .getMany();
  },
  addNameResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
  ) => {
    const formattedSearchString =
      formatStringToPostgresSearchStringArrayWithWildCard(searchDto.name!);
    return noiSubmissionRepository
      .createQueryBuilder('noiSub')
      .select('noiSub.fileNumber')
      .leftJoin(
        NoticeOfIntentOwner,
        'notice_of_intent_owner',
        'notice_of_intent_owner.notice_of_intent_submission_uuid = noiSub.uuid',
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where(
              "LOWER(notice_of_intent_owner.first_name || ' ' || notice_of_intent_owner.last_name) LIKE ANY (:names)",
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notice_of_intent_owner.first_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notice_of_intent_owner.last_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            )
            .orWhere(
              'LOWER(notice_of_intent_owner.organization_name) LIKE ANY (:names)',
              {
                names: formattedSearchString,
              },
            ),
        ),
      )
      .getMany();
  },
  addGovernmentResults: async (
    searchDto: SearchRequestDto,
    noiRepository: Repository<NoticeOfIntent>,
    governmentRepository: Repository<LocalGovernment>,
  ) => {
    const government = await governmentRepository.findOneByOrFail({
      name: searchDto.governmentName,
    });

    return noiRepository.find({
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
    noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
  ) => {
    const query = noiSubmissionRepository
      .createQueryBuilder('noiSub')
      .select('noiSub.fileNumber')
      .leftJoin(
        NoticeOfIntentParcel,
        'parcel',
        'parcel.notice_of_intent_submission_uuid = noiSub.uuid',
      );

    if (searchDto.pid) {
      query.andWhere('parcel.pid = :pid', { pid: searchDto.pid });
    }

    if (searchDto.civicAddress) {
      query.andWhere('LOWER(parcel.civic_address) like LOWER(:civic_address)', {
        civic_address: `%${searchDto.civicAddress}%`.toLowerCase(),
      });
    }

    return query.getMany();
  },
  addFileTypeResults: (
    searchDto: InboxRequestDto,
    noiRepository: Repository<NoticeOfIntent>,
  ) => {
    return noiRepository.find({
      select: {
        fileNumber: true,
      },
    });
  },
};
