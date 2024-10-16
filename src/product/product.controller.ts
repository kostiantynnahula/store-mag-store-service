import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { SheetService } from './sheet/sheet.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProductDto,
  ProductTopics,
  UpdateProductDto,
} from 'store-mag-types';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly sheetService: SheetService,
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
    console.log(data);
    return await this.sheetService.addRow(data);
  }

  @MessagePattern(ProductTopics.UPDATE_PRODUCT)
  async updateProduct(@Payload() data: UpdateProductDto) {
    return await this.sheetService.editRow(data);
  }

  @MessagePattern(ProductTopics.DELETE_PRODUCT)
  async deleteProduct(@Payload() index: number) {
    return await this.sheetService.deleteRow(index);
  }
}
