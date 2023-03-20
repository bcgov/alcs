import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
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
import { NotificationDto } from './notification.dto';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('notification')
@UseGuards(RolesGuard)
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    @InjectMapper() private autoMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getMyNotifications(@Req() req): Promise<NotificationDto[]> {
    const userId = req.user.entity.uuid;
    if (userId) {
      const notifications = await this.notificationService.list(userId);
      return this.mapToDto(notifications);
    } else {
      return [];
    }
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
  async markAllRead(@Req() req): Promise<void> {
    const userId = req.user.entity.uuid;
    await this.notificationService.markAllRead(userId);
  }

  @Post('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async markRead(@Req() req, @Param('uuid') id): Promise<void> {
    const userId = req.user.entity.uuid;
    const notification = await this.notificationService.get(id, userId);
    if (notification) {
      await this.notificationService.markRead(id);
    } else {
      throw new NotFoundException('Failed to find notification');
    }
  }

  private mapToDto(notifications: Notification[]): NotificationDto[] {
    return this.autoMapper.mapArray(
      notifications,
      Notification,
      NotificationDto,
    );
  }
}
