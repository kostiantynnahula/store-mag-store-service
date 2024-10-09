import { Controller } from '@nestjs/common';
import { StoreService } from './store.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('store')
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @MessagePattern('store.list')
  async list() {
    return await this.service.list();
  }
}
