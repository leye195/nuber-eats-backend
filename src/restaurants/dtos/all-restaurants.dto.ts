import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutPut } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class AllRestaurantOutput extends CoreOutPut {
  @Field(() => [Restaurant])
  restaurants?: Restaurant[];
}
