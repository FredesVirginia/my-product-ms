import { RpcException } from '@nestjs/microservices';
import { Category } from './../products/entity/category.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from 'src/products/dto/Category-created.dto';

import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {

    constructor(@InjectRepository(Category) private categoryRepository : Repository<Category>){}

     async createCategory( categoryDto : CreateCategoryDto){
        try{
            const newCategory = await this.categoryRepository.save(categoryDto)
           return newCategory
        }catch(error){
            console.log("El error fue " , error)
            throw new RpcException({
                error : error
            })
        }
     }



}
