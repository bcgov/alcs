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
    return this.boardRepository.findOne({
      where: {
        code,
      },
      relations: ['applications'],
    });
  }

  changeBoard(application: Application, board: Board) {
    //DO LOGIC HERE
  }
}
