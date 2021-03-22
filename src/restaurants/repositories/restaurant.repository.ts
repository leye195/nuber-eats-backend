import { User } from 'src/users/entities/user.entity';
import { EntityRepository, Like, Raw, Repository } from 'typeorm';
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

  async search(
    query: string,
    page: number,
    take: number,
  ): Promise<[Restaurant[], number]> {
    const [restaurants, totalResults] = await this.findAndCount({
      where: {
        name: Raw((name) => `${name} ILIKE '%${query}%'`), // Insensative Like
      }, // send sql query directly through Raw
      take,
      skip: (page - 1) * take,
    });

    return [restaurants, totalResults];
  }

  async pagination(
    page: number,
    take: number,
  ): Promise<[Restaurant[], number]> {
    const [restaurants, totalResults] = await this.findAndCount({
      take,
      skip: (page - 1) * take,
    });

    return [restaurants, totalResults];
  }
}
