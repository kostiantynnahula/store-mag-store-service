import { Controller } from '@nestjs/common';
import { StoreService } from './store.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @MessagePattern('store.list')
  async list() {
    return await this.service.list();
  }

  @MessagePattern('store.create')
  async create(@Payload() data: CreateStoreDto) {
    return await this.service.create(data);
  }

  @MessagePattern('store.update')
  async update(@Payload() data: UpdateStoreDto) {
    return await this.service.update(data);
  }

  @MessagePattern('store.delete')
  async delete(@Payload() id: string) {
    return await this.service.delete(id);
  }

  @MessagePattern('store.findById')
  async findById(@Payload() id: string) {
    return await this.service.findById(id);
  }
}
