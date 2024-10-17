import { Controller } from '@nestjs/common';
import { SheetService } from './sheet/sheet.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  badRequest,
  CreateProductDto,
  ProductTopics,
  UpdateProductDto,
} from 'store-mag-types';
import { SupplierService } from 'src/supplier/supplier.service';
import { StoreService } from 'src/store/store.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly sheetService: SheetService,
    private readonly supplierService: SupplierService,
    private readonly storeService: StoreService,
  ) {}

  @MessagePattern(ProductTopics.LIST_PRODUCT)
  async getProductList() {
    return await this.sheetService.getSheetData();
  }

  @MessagePattern(ProductTopics.FIND_PRODUCT)
  async getProductByIndex(@Payload() index: string) {
    return await this.sheetService.getSheetRowData(index);
  }

  @MessagePattern(ProductTopics.CREATE_PRODUCT)
  async createProduct(@Payload() data: CreateProductDto) {
    const { supplier, storeId } = data;

    const store = await this.storeService.findById(storeId);

    if (!store) {
      return badRequest('Store not found');
    }

    const supplierItem = await this.supplierService.findByName(supplier);

    if (!supplierItem) {
      return badRequest('Supplier not found');
    }

    return await this.sheetService.addRow(data);
  }

  @MessagePattern(ProductTopics.UPDATE_PRODUCT)
  async updateProduct(@Payload() data: UpdateProductDto) {
    if (data.storeId) {
      const store = await this.storeService.findById(data.storeId);

      if (!store) {
        return badRequest('Store not found');
      }
    }

    if (data.supplier) {
      const supplierItem = await this.supplierService.findByName(data.supplier);

      if (!supplierItem) {
        return badRequest('Supplier not found');
      }
    }

    return await this.sheetService.editRow(data);
  }

  @MessagePattern(ProductTopics.DELETE_PRODUCT)
  async deleteProduct(@Payload() index: number) {
    return await this.sheetService.deleteRow(index);
  }
}
