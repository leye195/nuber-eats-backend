import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';

enum UserRole {
  Client,
  Owner,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' }); // add enum type on graphql

@InputType({ isAbstract: true })
@ObjectType() //자동으로 schema를 build 하기위해 사용하는 graphql decorator
@Entity() //Entity for typeORM
export class User extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  email: string;

  @Field(() => String)
  @Column()
  @IsString()
  password: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}
