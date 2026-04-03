import { Module, forwardRef } from '@nestjs/common';
import { DepensesController } from './depenses.controller';
import { DepensesService } from './depenses.service';
import { BudgetsModule } from '../budgets/budgets.module';
import { EpargneModule } from '../epargne/epargne.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConseilsModule } from '../conseils/conseils.module';

@Module({
  imports: [
    forwardRef(() => BudgetsModule),
    forwardRef(() => EpargneModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => ConseilsModule),
  ],
  controllers: [DepensesController],
  providers: [DepensesService],
  exports: [DepensesService],
})
export class DepensesModule {}
