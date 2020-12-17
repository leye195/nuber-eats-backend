import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dtos/createRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
// Restaurant의 Resolver라는 것을 알림
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(() => Boolean)
  createRestaurant(@Args() restaurant: CreateRestaurantDTO): boolean {
    console.log(restaurant);
    return true;
  }
}
