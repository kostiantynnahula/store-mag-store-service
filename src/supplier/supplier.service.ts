import { Injectable } from '@nestjs/common';

@Injectable()
export class SupplierService {
  private readonly suppliers = [
    {
      id: 1,
      name: 'Цифротех',
    },
    {
      id: 2,
      name: 'TTT',
    },
    {
      id: 3,
      name: 'RadioLine',
    },
    {
      id: 4,
      name: 'Life TTT',
    },
  ];

  async list() {
    return this.suppliers;
  }

  async get(id: number) {
    return this.suppliers.find((supplier) => supplier.id === id);
  }

  async findByName(name: string) {
    return this.suppliers.find((supplier) => supplier.name === name);
  }
}
