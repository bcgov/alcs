import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { CARD_STATUS } from '../card/card-status/card-status.entity';
import { CardType } from '../card/card-type/card-type.entity';
import { CardService } from '../card/card.service';
import { BoardStatus } from './board-status.entity';
import { BoardDto } from './board.dto';
import { Board } from './board.entity';

@Injectable()
export class BoardService {
  private DEFAULT_RELATIONS: FindOptionsRelations<Board> = {
    statuses: {
      status: true,
    },
    allowedCardTypes: true,
    createCardTypes: true,
  };

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardStatus)
    private boardStatusRepository: Repository<BoardStatus>,
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

  async getBoardsWithStatus(code: CARD_STATUS) {
    return this.boardRepository.find({
      where: {
        statuses: {
          status: {
            code,
          },
        },
      },
      relations: {
        statuses: true,
      },
    });
  }

  async delete(code: string) {
    const board = await this.getOneOrFail({
      code,
    });

    //Un-link all statuses first
    await this.boardStatusRepository.delete({
      board: {
        uuid: board.uuid,
      },
    });

    await this.boardRepository.remove(board);
  }

  async create(createDto: BoardDto) {
    await this.saveUpdates(new Board(), createDto);
  }

  async update(code: string, updateDto: BoardDto) {
    const board = await this.getOneOrFail({
      code,
    });
    await this.saveUpdates(board, updateDto);
  }

  private async saveUpdates(board: Board, updateDto: BoardDto) {
    const cardTypes = await this.cardService.getCardTypes();

    board.title = updateDto.title;
    board.allowedCardTypes = updateDto.allowedCardTypes.map(
      (code) => cardTypes.find((cardType) => cardType.code === code)!,
    );
    board.createCardTypes = updateDto.createCardTypes.map(
      (code) => cardTypes.find((cardType) => cardType.code === code)!,
    );

    await this.boardRepository.save(board);

    await this.boardStatusRepository.delete({
      board: {
        uuid: board.uuid,
      },
    });

    const newStatuses = updateDto.statuses.map(
      (status) =>
        new BoardStatus({
          board,
          order: status.order,
          statusCode: status.statusCode,
        }),
    );

    await this.boardStatusRepository.save(newStatuses);
  }
}
