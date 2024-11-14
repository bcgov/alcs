import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { StatusUpdateSearchResultDto } from '../search.dto';
import { ApplicationSubmissionStatusSearchView } from './application-search-status-view.entity';
import { NoiSubmissionStatusSearchView } from './noi-search-status-view.entity';
import { NotificationSubmissionStatusSearchView } from './notification-search-status-view.entity';

@Injectable()
export class SearchStatusService {
  private logger: Logger = new Logger(SearchStatusService.name);

  constructor(
    @InjectRepository(ApplicationSubmissionStatusSearchView)
    private applicationStatusSearchRepository: Repository<ApplicationSubmissionStatusSearchView>,
    @InjectRepository(NoiSubmissionStatusSearchView)
    private noiStatusSearchRepository: Repository<NoiSubmissionStatusSearchView>,
    @InjectRepository(NotificationSubmissionStatusSearchView)
    private notificationStatusSearchRepository: Repository<NotificationSubmissionStatusSearchView>,
  ) {}

  async searchApplicationStatus(
    fileNumbers: string[],
    queryRunner: QueryRunner,
  ): Promise<StatusUpdateSearchResultDto[]> {
    const query = this.applicationStatusSearchRepository
      .createQueryBuilder('appSearch', queryRunner)
      .andWhere('appSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers],
      });

    const t0 = performance.now();
    const results = await Promise.all([query.getMany()]);
    const t1 = performance.now();
    this.logger.debug(`ALCS Application status search took ${t1 - t0} milliseconds.`);

    const statusArray: StatusUpdateSearchResultDto[] = results[0].map((r) => {
      return {
        fileNumber: r.fileNumber,
        status: r.status.status_type_code,
      };
    });

    return statusArray;
  }

  async searchNoiStatus(fileNumbers: string[], queryRunner: QueryRunner): Promise<StatusUpdateSearchResultDto[]> {
    const query = this.noiStatusSearchRepository
      .createQueryBuilder('noiSearch', queryRunner)
      .andWhere('noiSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers],
      });
    const t0 = performance.now();
    const results = await Promise.all([query.getMany()]);
    const t1 = performance.now();
    this.logger.debug(`ALCS Noi status search took ${t1 - t0} milliseconds.`);

    const statusArray: StatusUpdateSearchResultDto[] = results[0].map((r) => {
      return {
        fileNumber: r.fileNumber,
        status: r.status.status_type_code,
      };
    });

    return statusArray;
  }

  async searchNotificationStatus(
    fileNumbers: string[],
    queryRunner: QueryRunner,
  ): Promise<StatusUpdateSearchResultDto[]> {
    const query = this.notificationStatusSearchRepository
      .createQueryBuilder('notSearch', queryRunner)
      .andWhere('notSearch.fileNumber IN(:...fileNumbers)', {
        fileNumbers: [...fileNumbers],
      });
    const t0 = performance.now();
    const results = await Promise.all([query.getMany()]);
    const t1 = performance.now();
    this.logger.debug(`ALCS Notification status search took ${t1 - t0} milliseconds.`);

    const statusArray: StatusUpdateSearchResultDto[] = results[0].map((r) => {
      return {
        fileNumber: r.fileNumber,
        status: r.status.status_type_code,
      };
    });

    return statusArray;
  }
}
