import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connected } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateConnectedDto } from './dto';

@Injectable()
export class ConnectedService {
  constructor(
    @InjectRepository(Connected)
    private readonly connectedRepository: Repository<Connected>
  ) {}

  async createConnected(connected: CreateConnectedDto): Promise<Connected> {
    const newConnected = this.connectedRepository.create(connected);
    await this.connectedRepository.save(newConnected);
    return newConnected;
  }

  async findConnectedByUserUuid(user_uuid: string): Promise<Connected[]> {
    //console.log(user_uuid)
    return await this.connectedRepository.query(`
    SELECT * FROM "connected" WHERE "user_uuid" = '${user_uuid}' 
    `);
  }

  async deleteConnectedBySocketId(socket_id: string) {
    await this.connectedRepository
      .createQueryBuilder()
      .delete()
      .where('socket_id = :socket_id', { socket_id })
      .execute();
  }

  async deleteAllConnected() {
    await this.connectedRepository.createQueryBuilder().delete().execute();
  }
}
