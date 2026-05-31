import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findById(id: number) {
    return this.repo.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  findByName(name: string) {
    return this.repo.findOneBy({ name });
  }

  findAll() {
    return this.repo.find({ select: ['id', 'name', 'email', 'role', 'created_at'] });
  }

  async create(name: string, email: string, password: string, role: UserRole = 'user') {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');
    const password_hash = await bcrypt.hash(password, 10);
    return this.repo.save(this.repo.create({ name, email, password_hash, role }));
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
