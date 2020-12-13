import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dtos/createRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver()
// Restaurant의 Resolver라는 것을 알림
export class RestaurantResolver {
  @Query(() => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }

  @Mutation(() => Boolean)
  createRestaurant(@Args() restaurant: CreateRestaurantDTO): boolean {
    console.log(restaurant);
    return true;
  }
}
