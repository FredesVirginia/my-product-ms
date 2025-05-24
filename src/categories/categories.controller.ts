import { Body, Controller, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateCategoryDto } from 'src/products/dto/Category-created.dto';

@Controller('categories')
export class CategoriesController {

    constructor(private readonly categoryService : CategoriesService){}

    @MessagePattern('create-category')
    @Post()
    async createCategory(@Body() categoryDto : CreateCategoryDto){
        const newCategory = await this.categoryService.createCategory(categoryDto)
        return newCategory
    }
}
