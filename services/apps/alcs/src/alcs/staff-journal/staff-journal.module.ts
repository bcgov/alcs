import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffJournalController } from './staff-journal.controller';
import { StaffJournal } from './staff-journal.entity';
import { StaffJournalService } from './staff-journal.service';

@Module({
  imports: [TypeOrmModule.forFeature([StaffJournal])],
  controllers: [StaffJournalController],
  providers: [StaffJournalService],
})
export class StaffJournalModule {}
