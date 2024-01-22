import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { MessageDto } from './message.dto';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('message')
@UseGuards(RolesGuard)
export class MessageController {
  constructor(
    private messageService: MessageService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getMyNotifications(@Req() req): Promise<MessageDto[]> {
    const userId = req.user.entity.uuid;
    if (userId) {
      const messages = await this.messageService.list(userId);
      return this.mapToDto(messages);
    } else {
      return [];
    }
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async markAllRead(@Req() req): Promise<void> {
    const userId = req.user.entity.uuid;
    await this.messageService.markAllRead(userId);
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async markRead(@Req() req, @Param('uuid') id): Promise<void> {
    const userId = req.user.entity.uuid;
    const message = await this.messageService.get(id, userId);
    if (message) {
      await this.messageService.markRead(id);
    } else {
      throw new NotFoundException('Failed to find message');
    }
  }

  private mapToDto(notifications: Message[]): MessageDto[] {
    return this.autoMapper.mapArray(notifications, Message, MessageDto);
  }
}
