import { Module } from '@nestjs/common';
import { EpargneController } from './epargne.controller';
import { EpargneService } from './epargne.service';

@Module({
  controllers: [EpargneController],
  providers: [EpargneService],
  exports: [EpargneService],
})
export class EpargneModule {}
