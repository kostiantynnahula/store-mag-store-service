import { Controller } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly service: SupplierService) {}

  @MessagePattern('supplier.list')
  async list() {
    return await this.service.list();
  }

  @MessagePattern('supplier.findById')
  async findById(id: number) {
    return await this.service.get(id);
  }
}
