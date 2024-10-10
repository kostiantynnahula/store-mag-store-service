import { Injectable } from '@nestjs/common';
import { Store } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Store[]> {
    return this.prisma.store.findMany();
  }

  async findById(id: string): Promise<Store> {
    return this.prisma.store.findUnique({
      where: { id },
    });
  }

  async create(data: CreateStoreDto): Promise<Store> {
    return this.prisma.store.create({
      data: {
        name: data.name,
        address: data.address,
      },
    });
  }

  async update({ id, ...data }: UpdateStoreDto): Promise<Store> {
    return this.prisma.store.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Store> {
    return this.prisma.store.delete({
      where: { id },
    });
  }
}
