import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageProfile } from '../../common/automapper/message.automapper.profile';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService, MessageProfile],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
