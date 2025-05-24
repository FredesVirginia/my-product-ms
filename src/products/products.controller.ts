import { Body, Controller, Delete, Get, Param,  ParseUUIDPipe, Post } from '@nestjs/common';


import { MessagePattern, Payload } from '@nestjs/microservices';


import { ProductService } from './products.service';
import { CreateProductDto } from './dto/Product-created.dto';

@Controller('products')
export class ProductController {
    constructor (private readonly productService : ProductService){}

    @MessagePattern('create-product')
    @Post()
    async createUser(@Body() userTodoListDto : CreateProductDto){
        const newTodoList = await this.productService.createProduct(userTodoListDto)
        return newTodoList
    }

    @MessagePattern('show-all-product')
    @Get()
    async getAllUser(){
        return await this.productService.getAllProduct()
    }

    @Get(':id')
    async getTodoListId(@Param('id' , new ParseUUIDPipe()) id: string){
        return this.productService.getIdTodoList(id)
    }


    @Delete(':id')
    async deleteTodoList(@Param('id' , new ParseUUIDPipe()) id:string){
        return this.productService.deleteTodoList(id)
    }

   
}
