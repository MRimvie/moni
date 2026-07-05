import { Module } from '@nestjs/common';
import { EpargneController } from './epargne.controller';
import { EpargneService } from './epargne.service';
import { EpargneCronService } from './epargne-cron.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EpargneController],
  providers: [EpargneService, EpargneCronService],
  exports: [EpargneService],
})
export class EpargneModule {}
