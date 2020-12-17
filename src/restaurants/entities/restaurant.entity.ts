import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType() //자동으로 schema를 build 하기위해 사용하는 graphql decorator
@Entity() //Entity for typeORM
export class Restaurant {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Boolean, { nullable: true })
  @Column()
  isVegan?: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  category: string;
}
