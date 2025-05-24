import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { Product } from './entity/product.entity';
import { Category } from './entity/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Product , Category])], 
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
