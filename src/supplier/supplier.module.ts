import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';

@Module({
  providers: [SupplierService],
  exports: [SupplierService],
  controllers: [SupplierController],
})
export class SupplierModule {}
