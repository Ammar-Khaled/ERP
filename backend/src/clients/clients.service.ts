import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { Address } from 'src/common/entities/address.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import * as jsend from 'jsend'; // Import jsend

@Injectable()
export class ClientsService {
  constructor(
    @Inject('CLIENT_REPOSITORY')
    private clientRepository: Repository<Client>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
  ) {}

  private async findClientByCondition(condition: object, errorMessage: string) {
    const client = await this.clientRepository.findOne({
      where: condition,
      relations: ['address'],
    });
    if (!client) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return client;
  }

  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });
    if (existingClient) {
      throw new ConflictException(
        jsend.fail({ message: 'The Client already exists.' }),
      );
    }

    const client = this.clientRepository.create(createClientDto);

    if (createClientDto.address) {
      // Create and save a new address if provided
      const newAddress = this.addressRepository.create(createClientDto.address);
      const savedAddress = await this.addressRepository.save(newAddress);
      client.address = savedAddress;
    }

    try {
      const newClient = await this.clientRepository.save(client);
      return jsend.success(newClient);
    } catch (error) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while creating the client. Please try again later.',
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    // Retrieve the client with relations
    const client = await this.findClientByCondition({ id }, 'Client not found');

    // Check and handle address updates
    if (updateClientDto.address) {
      if (client.address) {
        // Update the existing address
        Object.assign(client.address, updateClientDto.address);
        await this.addressRepository.save(client.address);
      } else {
        // Create and associate a new address
        const newAddress = this.addressRepository.create(
          updateClientDto.address,
        );
        const savedAddress = await this.addressRepository.save(newAddress);
        client.address = savedAddress;
      }
    }

    // Remove `address` from `updateClientDto` to avoid redundant updates
    const { address, ...clientUpdates } = updateClientDto;

    // Ensure there are fields to update
    if (Object.keys(clientUpdates).length > 0) {
      // Update the client fields
      Object.assign(client, clientUpdates);

      // Check for email conflict if email is being updated
      if (clientUpdates.email && clientUpdates.email !== client.email) {
        const existingClient = await this.clientRepository.findOne({
          where: { email: clientUpdates.email },
        });
        if (existingClient && existingClient.id !== id) {
          throw new ConflictException(
            jsend.fail({
              message: `Email ${clientUpdates.email} is already in use.`,
            }),
          );
        }
      }

      // Save the client
      await this.clientRepository.save(client);
    }

    return jsend.success(client);
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
    await this.clientRepository.delete({ id });
    return jsend.success(client);
  }

  async findByEmail(email: string) {
    const client = await this.findClientByCondition(
      { email },
      'Client not found',
    );
    return jsend.success(client);
  }

  async findByPhone(phoneNumber: string) {
    const client = await this.findClientByCondition(
      { phone_number: phoneNumber },
      'Client not found',
    );
    return jsend.success(client);
  }
}