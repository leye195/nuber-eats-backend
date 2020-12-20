import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDTO } from './dtos/createRestaurant.dto';
import { UpdateRestaurantDTO } from './dtos/updateRestaurent.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) //Restaurant Entity를 Repository로 inject
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  createRestaurant(
    createRestaurantDTO: CreateRestaurantDTO,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(createRestaurantDTO); // 객체 생성
    return this.restaurants.save(newRestaurant); // save on DB
  }

  updateRestaurent({ id, data }: UpdateRestaurantDTO) {
    return this.restaurants.update(id, { ...data });
  }
}
