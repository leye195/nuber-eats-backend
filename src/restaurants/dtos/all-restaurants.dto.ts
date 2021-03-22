import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';

@InputType()
export class AllRestaurantsInput extends PaginationInput {}

@ObjectType()
export class AllRestaurantsOutput extends PaginationOutput {
  @Field(() => [Restaurant])
  results?: Restaurant[];
}
