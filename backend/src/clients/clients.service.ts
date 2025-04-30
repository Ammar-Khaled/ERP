import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

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
    // Retrieve the client
    const client = await this.clientRepository.findOneBy({ id });

    // Check and handle address updates by the cascading
    if (updateClientDto.address) {
      if (client.address?.id) {
        updateClientDto.address.id = client.address.id;
      }
    }

    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll() {
    return await this.clientRepository.find();
  }

  async findOne(id: number) {
    return await this.clientRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const client = await this.clientRepository.findOneBy({ id });
    await this.clientRepository.softRemove(client);
    return client;
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
}
