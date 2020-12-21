import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutPut } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutPut extends MutationOutPut {
  @Field(() => String, { nullable: true })
  token?: string;
}
