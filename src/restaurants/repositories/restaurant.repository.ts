import { User } from 'src/users/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async checkExist(id: number): Promise<boolean> {
    const restaurant = await this.findOne({ id });
    //check restaurant exist
    if (!restaurant) return false;
    return true;
  }
  async checkIsOwner(id: number, user: User): Promise<boolean> {
    const restaurant = await this.findOne({ id });
    if (restaurant.ownerId !== user.id) return false;
    return true;
  }
}
