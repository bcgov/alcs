import { Brackets, Repository } from 'typeorm';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { InboxRequestDto } from '../../portal/inbox/inbox.dto';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentParcel } from '../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { SearchRequestDto } from '../../portal/public/search/public-search.dto';
import { formatNameSearchString } from '../search-helper';

export const NOI_SEARCH_FILTERS = {
  addFileNumberResults: (searchDto: SearchRequestDto | InboxRequestDto, noiRepository: Repository<NoticeOfIntent>) => {
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
  addTagsResults: (searchDto: SearchRequestDto | InboxRequestDto, noiRepository: Repository<NoticeOfIntent>) => {
    return noiRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber')
      .leftJoin('notice_of_intent_tag', 'notice_of_intent_tag', 'notice_of_intent_tag.notice_of_intent_uuid = noi.uuid')
      .where('notice_of_intent_tag.tag_uuid IN (:...tagIds)', {
        tagIds: searchDto.tagIds,
      })
      .groupBy('noi.fileNumber')
      .addGroupBy('noi.uuid')
      .having('count(distinct tag_uuid) = :countCategories', {
        countCategories: searchDto.tagIds?.length,
      })
      .getMany();
  },
  addTagCategoryResults: (searchDto: SearchRequestDto | InboxRequestDto, noiRepository: Repository<NoticeOfIntent>) => {
    return noiRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber')
      .leftJoin('notice_of_intent_tag', 'notice_of_intent_tag', 'notice_of_intent_tag.notice_of_intent_uuid = noi.uuid')
      .leftJoin('tag', 'tag', 'tag.uuid = notice_of_intent_tag.tag_uuid')
      .where('tag.category_uuid IN (:categoryId)', {
        categoryId: searchDto.tagCategoryId,
      })
      .getMany();
  },
  addDecisionOutcomeResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    appRepository: Repository<NoticeOfIntent>,
  ) => {
    return appRepository
      .createQueryBuilder('noi')
      .select('noi.fileNumber')
      .leftJoin(
        'notice_of_intent_decision',
        'notice_of_intent_decision',
        'notice_of_intent_decision.notice_of_intent_uuid = noi.uuid',
      )
      .where('notice_of_intent_decision.outcome_code IN (:...outcomeCodes)', {
        outcomeCodes: searchDto.decisionOutcomes,
      })
      .getMany();
  },
  addNameResults: (
    searchDto: SearchRequestDto | InboxRequestDto,
    noiSubmissionRepository: Repository<NoticeOfIntentSubmission>,
  ) => {
    const formattedSearchString = formatNameSearchString(searchDto.name!);
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
              "LOWER(CONCAT_WS(' ', notice_of_intent_owner.first_name, notice_of_intent_owner.last_name)) LIKE :name",
              {
                name: formattedSearchString,
              },
            )
            .orWhere('LOWER(notice_of_intent_owner.first_name) LIKE :name', {
              name: formattedSearchString,
            })
            .orWhere('LOWER(notice_of_intent_owner.last_name) LIKE :name', {
              name: formattedSearchString,
            })
            .orWhere('LOWER(notice_of_intent_owner.organization_name) LIKE :name', {
              name: formattedSearchString,
            }),
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
      .leftJoin(NoticeOfIntentParcel, 'parcel', 'parcel.notice_of_intent_submission_uuid = noiSub.uuid');

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
  addFileTypeResults: (searchDto: SearchRequestDto | InboxRequestDto, noiRepository: Repository<NoticeOfIntent>) => {
    return noiRepository.find({
      select: {
        fileNumber: true,
      },
    });
  },
};
