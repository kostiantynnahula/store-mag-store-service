import { Controller } from '@nestjs/common';
import { StoreService } from './store.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ListQuery, StoreTopics } from 'store-mag-types';

@Controller('store')
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @MessagePattern(StoreTopics.LIST_STORE)
  async list(@Payload() query: ListQuery) {
    return await this.service.list(query);
  }

  @MessagePattern(StoreTopics.CREATE_STORE)
  async create(@Payload() data: CreateStoreDto) {
    return await this.service.create(data);
  }

  @MessagePattern(StoreTopics.UPDATE_STORE)
  async update(@Payload() data: UpdateStoreDto) {
    return await this.service.update(data);
  }

  @MessagePattern(StoreTopics.DELETE_STORE)
  async delete(@Payload() id: string) {
    return await this.service.delete(id);
  }

  @MessagePattern(StoreTopics.FIND_STORE)
  async findById(@Payload() id: string) {
    return await this.service.findById(id);
  }
}
