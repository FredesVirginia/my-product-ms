import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;



  @Column('decimal')
  price : number;

  @Column()
  stock : number;

  @Column({nullable : true})
  imagess: string;

  @ManyToOne(()=> Category , (category)=> category.products)
  category : Category

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
}
