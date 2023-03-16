import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationProfile } from '../../common/automapper/notification.automapper.profile';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationService, NotificationProfile],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
