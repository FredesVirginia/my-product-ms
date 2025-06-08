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

import { CreateProductDto, UpdateProductDto } from './dto/Product-created.dto';
import { Product } from './entity/product.entity';
import { Category } from './entity/category.entity';
import { ProductReconmedationDto } from './dto/ProductReconmedation.dto';
import {
  ProductDtoDetails,
  ProductDtoForDecreaseQuantity,
} from './dto/ProductDto.dto';

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

  async getAllProduct(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string,
  ) {
    try {
      console.log('Filtros recibidos:', {
        category,
        minPrice,
        maxPrice,
        search,
      });

      const queyProductWithOutFilter = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category');
      console.log('LA CATEGORIA ES ', category);
      if (category) {
        console.log('PRIMERO');
        const foundCategory = await this.categoryRepository.findOne({
          where: { name: category },
        });
      }

      if (minPrice) {
        queyProductWithOutFilter.andWhere('product.price >= :minPrice', {
          minPrice,
        });
      }

      if (maxPrice) {
        queyProductWithOutFilter.andWhere('product.price <= :maxPrice', {
          maxPrice,
        });
      }

      if (search) {
        queyProductWithOutFilter.andWhere('product.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      return await queyProductWithOutFilter.getMany();
    } catch (error) {
      throw new RpcException({
        HttpStatus: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async getDetailsCart(data: ProductDtoDetails) {
    const productId = data.products.map((item) => item.productId);
    const products = await this.productRepository
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.category', 'category')
      .where('products.id IN (:...productId)', { productId })
      .getMany();

    let total = 0;
    const productsWithQuantity = products.map((product) => {
      const cartItem = data.products.find(
        (item) => item.productId === product.id,
      );
      const quantity = cartItem ? cartItem.quantity : 0;
      const subtotal = product.price * quantity;
      total += subtotal;

      return {
        ...product,
        quantity,
        subtotal,
      };
    });

    console.log(productsWithQuantity)
    return {
      products: productsWithQuantity,
      total,
    };
  }

  async decrementProductStock(data: ProductDtoForDecreaseQuantity) {
    const queryRunner =
      this.productRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of data.products) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new RpcException(
            `Producto con id ${item.productId} no encontrado`,
          );
        }

        if (product.stock < item.quantity) {
          throw new RpcException(
            `Stock insuficiente para el producto ${product.id}. Disponible: ${product.stock}, requerido: ${item.quantity}`,
          );
        }

        product.stock -= item.quantity;
        await queryRunner.manager.save(product);
      }

      await queryRunner.commitTransaction();
      return { message: 'Stock actualizado correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(payload: { id: string; data: UpdateProductDto }) {
    const { id, data } = payload;

    const product = await this.productRepository.findOne({
      where: { id: payload.id },
    });
    if (!product) throw new RpcException(`Producto con id ${id} no encontrado`);

    // Extraer categoryId del DTO si existe
    const { category, ...rest } = data;
    const categoryLookFor = await this.categoryRepository.findOne({
      where: { id: category },
    });
    // Actualizar campos simples
    this.productRepository.merge(product, rest);

    // Si category viene, asignar la relación manualmente
    if (!categoryLookFor) {
      throw new RpcException(`Categoria con id ${category} no encontrado`);
    }

    product.category = categoryLookFor;

    return this.productRepository.save(product);
  }

  async getAllProductRecomendation(data: ProductReconmedationDto) {
    const categoryProductMasComprado = data.categoriaDeProductoComprado;
    const productosComprados = data.productosComprados;

    console.log('PRODUCTOS COMPRADOS', productosComprados);
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

    console.log('RESULTADO', productosRecomendados);
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
    const todoList = await this.productRepository.findOne({ where: { id } });
    if (!todoList) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const data = await this.productRepository.remove(todoList);
    return {
      status: HttpStatus.ACCEPTED,
      data,
    };
  }

  async deleteProduct(id: string) {
    console.log('EL ID ES ', id);
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    console.log('PRODUCT', product);

    const data = await this.productRepository.remove(product);
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
