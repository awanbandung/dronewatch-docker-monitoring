import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drone } from '../entities/drone.entity';

@Injectable()
export class DronesService {
  constructor(@InjectRepository(Drone) private repo: Repository<Drone>) {}

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const drone = await this.repo.findOneBy({ id });
    if (!drone) throw new NotFoundException(`Drone ${id} not found`);
    return drone;
  }
}
