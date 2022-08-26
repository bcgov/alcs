import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { ApplicationService } from '../application/application.service';
import { ServiceNotFoundException } from '../common/exceptions/base.exception';
import { Board } from './board.entity';

@Injectable()
export class BoardService {
  private DEFAULT_RELATIONS: FindOptionsRelations<Board> = {
    statuses: {
      status: true,
    },
  };

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private applicationService: ApplicationService,
  ) {}

  async list() {
    const boards = await this.boardRepository.find({
      relations: this.DEFAULT_RELATIONS,
    });
    //Sort board statuses
    return boards.map((board) => {
      board.statuses.sort((statusA, statusB) => {
        return statusA.order - statusB.order;
      });
      return board;
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
      throw new ServiceNotFoundException(
        `Failed to find application with fileNumber ${fileNumber}`,
      );
    }

    const board = await this.boardRepository.findOne({
      where: {
        code,
      },
      relations: this.DEFAULT_RELATIONS,
    });
    if (!board) {
      throw new ServiceNotFoundException(
        `Failed to find Board with code ${code}`,
      );
    }

    const initialStatus = board.statuses.find((status) => status.order === 0);
    application.status = initialStatus.status;
    application.board = board;
    return this.applicationService.createOrUpdate(application);
  }
}
