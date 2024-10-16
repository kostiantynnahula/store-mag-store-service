import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SheetService } from './sheet/sheet.service';
import { SheetConvertorService } from 'src/utils/services/sheet-convert.service';
import { LocalCache } from 'src/utils/services/local-cache.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, SheetService, SheetConvertorService, LocalCache],
})
export class ProductModule {}
