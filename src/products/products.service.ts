import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { RpcException } from '@nestjs/microservices';

import { CreateProductDto } from './dto/Product-created.dto';
import { Product } from './entity/product.entity';
import { Category } from './entity/category.entity';
import {  ProductReconmedationDto } from './dto/ProductReconmedation.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async createProduct(userDto: CreateProductDto) {
    try {
      const categoryId = await this.categoryRepository.findOneBy({
        id: userDto.category,
      });
      const userNew = await this.productRepository.save({
        name: userDto.name,
        stock: userDto.stock,
        price: userDto.price,
        category: categoryId!,
      });
      return userNew;
    } catch (error) {
      console.log('EEROR FUE ', error);

      if (error.name === 'QueryFailedError') {
        throw new BadRequestException(
          'Datos inválidos o violación de restricciones',
        );
      }

      throw new InternalServerErrorException('Error interno del servidor');
    }
  }

  async getAllProduct() {
    try {
      const allProduct = await this.productRepository.find({
        relations: ['category'],
      });
      return allProduct;
    } catch (error) {
      throw new RpcException({
        HttpStatus: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async getAllProductRecomendation(data: ProductReconmedationDto) {
    const categoryProductMasComprado = data.categoriaDeProductoComprado;
    const productosComprados = data.productosComprados;

    console.log("PRODUCTOS COMPRADOS" , productosComprados)
    const productosRecomendados = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('category.id = :categoryId', {
        categoryId: categoryProductMasComprado,
      })
      .andWhere('product.id NOT IN (:...productosComprados)', {
        productosComprados,
      })
      .getMany();

      
      console.log("RESULTADO" , productosRecomendados)
      return productosRecomendados;
  }

  async getIdTodoList(id: string) {
    const todoListId = await this.productRepository.findOneBy({ id });
    if (!todoListId) {
      throw new NotFoundException('Tarea no encontrada');
    }
    return {
      status: HttpStatus.ACCEPTED,
      data: todoListId,
    };
  }

  async deleteTodoList(id: string) {
    const todoList = await this.productRepository.findOneBy({ id });
    if (!todoList) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const data = await this.productRepository.remove(todoList);
    return {
      status: HttpStatus.ACCEPTED,
      data,
    };
  }

  // async lookForTodoListByKeyWord( word : string){
  //   const todoList = await this.todoListRepository.find({
  //     where : [
  //       {title : ILike(`%${word}%`)},
  //       {description : ILike(`%${word}%`)},
  //       {content : ILike(`%${word}%`)}
  //     ]
  //   })

  //    if(!todoList){
  //     throw new NotFoundException(`No se encontraron tareas con la palabra clave ${word}`)
  //    }

  //    return todoList
  // }
}
