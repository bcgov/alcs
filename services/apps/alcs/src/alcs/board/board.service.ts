import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CardService } from '../card/card.service';
import { Board } from './board.entity';

@Injectable()
export class BoardService {
  private DEFAULT_RELATIONS: FindOptionsRelations<Board> = {
    statuses: {
      status: true,
    },
    allowedCardTypes: true,
  };

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private cardService: CardService,
  ) {}

  async getOneOrFail(options: FindOptionsWhere<Board>) {
    return this.boardRepository.findOneOrFail({
      where: options,
      relations: this.DEFAULT_RELATIONS,
    });
  }

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

  async changeBoard(cardUuid: string, code: string) {
    const card = await this.cardService.get(cardUuid);
    if (!card) {
      throw new ServiceNotFoundException(
        `Failed to find card with uuid ${cardUuid}`,
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
    if (!initialStatus) {
      throw new Error(`Failed to find initial status for board ${board.uuid}`);
    }

    card.status = initialStatus.status;
    card.board = board;
    return this.cardService.save(card);
  }
}
