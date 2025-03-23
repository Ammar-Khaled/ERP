import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as jsend from 'jsend';

@Injectable()
export class ClientsService {
  constructor(
    @Inject('CLIENT_REPOSITORY')
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    // Retrieve the client with relations
    const client = await this.findClientByCondition({ id }, 'Client not found');

    // Check and handle address updates
    if (updateClientDto.address) {
      if (client.address?.id) {
        updateClientDto.address.id = client.address.id;
      }
    }

    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll() {
    const clients = await this.clientRepository.find({
      relations: ['address'],
    });
    return jsend.success(clients);
  }

  async findOne(id: number) {
    const client = await this.findClientByCondition({ id }, 'Client not found');
    return jsend.success(client);
  }

  async remove(id: number) {
    const client = await this.findClientByCondition({ id }, 'Client not found');
    await this.clientRepository.softRemove(client);
    return jsend.success(client);
  }

  // async findByEmail(email: string) {
  //   const client = await this.findClientByCondition(
  //     { email },
  //     'Client not found',
  //   );
  //   return jsend.success(client);
  // }
  //
  // async findByPhone(phoneNumber: string) {
  //   const client = await this.findClientByCondition(
  //     { phone_number: phoneNumber },
  //     'Client not found',
  //   );
  //   return jsend.success(client);
  // }

  private async findClientByCondition(condition: object) {
    const client = await this.clientRepository.findOne({
      where: condition,
      relations: ['address'],
    });
    if (!client) {
      throw new NotFoundException();
    }
    return client;
  }
}
