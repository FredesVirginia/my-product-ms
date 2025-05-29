import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';

import { ProductService } from './products.service';
import { CreateProductDto } from './dto/Product-created.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { In, Repository } from 'typeorm';
import { ProductReconmedationDto } from './dto/ProductReconmedation.dto';

@Controller('products')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly productService: ProductService,
  ) {}

  @MessagePattern('create-product')
  async createUser(@Payload() userTodoListDto: CreateProductDto) {
    const newTodoList =
      await this.productService.createProduct(userTodoListDto);
    return newTodoList;
  }

  @MessagePattern('show-all-product')
  @Get()
  async getAllUser() {
    return await this.productService.getAllProduct();
  }

  @MessagePattern('get-products-by-ids')
  async getProductsByIds(@Payload() productIds: string[]) {
    return this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['category'],
    });
  }

  @MessagePattern('get-products-by-ids-and-category-id')
  async getProductsByIdsAndCategoryId(@Payload() productIds: string[]) {
    console.log('EL PRODUCT LLEGA ASI', productIds);
    const categoriaMasComprada = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['category'],
    });

    console.log('LUEGOOOOOOO', categoriaMasComprada[0].category.id);
    return categoriaMasComprada[0].category.id
  }

  @MessagePattern('get-product-recomendados')
  async getAllRecomendation(@Payload() data: ProductReconmedationDto) {
    console.log('LLEGADA', data);
    return this.productService.getAllProductRecomendation(data);
  }

  @MessagePattern('get-products-by-category')
  async getProductsByCategory(@Payload() categoryName: string) {
    return this.productRepository.find({
      where: { category: { name: categoryName } },
      relations: ['category'],
    });
  }

  @Get(':id')
  async getTodoListId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productService.getIdTodoList(id);
  }

  @Delete(':id')
  async deleteTodoList(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productService.deleteTodoList(id);
  }
}
