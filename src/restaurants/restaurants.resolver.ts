import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dtos/createRestaurant.dto';
import { UpdateRestaurantDTO } from './dtos/updateRestaurent.dto';
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
  async createRestaurant(
    @Args('input') restaurant: CreateRestaurantDTO,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(restaurant);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args() updateRestaurantDTO: UpdateRestaurantDTO,
  ): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurent(updateRestaurantDTO);
      return true;
    } catch (e) {
      console.log(e);
      return true;
    }
  }
}
