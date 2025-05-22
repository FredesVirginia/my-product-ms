import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}

export class SearTodoListByKeyword {
  @IsString()
  @IsNotEmpty()
  word: string;
}
