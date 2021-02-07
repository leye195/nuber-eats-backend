import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/createRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
// Restaurant의 Resolver라는 것을 알림
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Mutation(() => Boolean)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') restaurant: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, restaurant);
  }
}
