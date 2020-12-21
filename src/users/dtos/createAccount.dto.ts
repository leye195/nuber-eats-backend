import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutPut } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInPut extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutPut extends MutationOutPut {}
