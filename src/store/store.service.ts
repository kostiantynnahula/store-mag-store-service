import { Injectable } from '@nestjs/common';
import { Store, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ListQuery, ListResponse } from 'store-mag-types';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    perPage = 10,
    sort = 'createdAt',
    order = 'desc',
    q = '',
  }: ListQuery): Promise<ListResponse<Store>> {
    const skip = Number((page - 1) * perPage);
    const take = Number(perPage);

    const query = {
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            address: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      } as Prisma.StoreWhereInput,
      skip,
      take,
      orderBy: {
        [sort]: order,
      },
    };

    const [list, count] = await this.prisma.$transaction([
      this.prisma.store.findMany({
        ...query,
      }),
      this.prisma.store.count({ where: query.where }),
    ]);

    return { list, count };
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
