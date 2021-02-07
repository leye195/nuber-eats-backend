import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' }); // add enum type on graphql

@InputType('UserInputType', { isAbstract: true })
@ObjectType() //자동으로 schema를 build 하기위해 사용하는 graphql decorator
@Entity() //Entity for typeORM
export class User extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field(() => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field(() => Boolean)
  @Column({ default: false })
  @IsBoolean()
  emailVerified: boolean;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(password, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
