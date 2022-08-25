import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../application/application.entity';
import { ApplicationService } from '../application/application.service';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { Board } from './board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private applicationService: ApplicationService,
  ) {}

  list() {
    return this.boardRepository.find({
      relations: ['statuses'],
      order: {
        statuses: {
          order: 'ASC',
        },
      },
    });
  }

  getApplicationsByCode(code: string) {
    return this.applicationService.getAll({
      board: {
        code,
      },
    });
  }

  async changeBoard(fileNumber: string, code: string) {
    const application = await this.applicationService.get(fileNumber);
    if (!application) {
      throw new ServiceNotFoundException('Failed to find application');
    }

    const board = await this.boardRepository.findOne({
      where: {
        code,
      },
      relations: ['statuses'],
    });
    if (!board) {
      throw new ServiceNotFoundException('Board not found');
    }

    const initialStatus = board.statuses.find((status) => status.order === 0);
    application.status = initialStatus.status;
    application.board = board;
    return this.applicationService.createOrUpdate(application);
  }
}
