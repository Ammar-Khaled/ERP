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
import { QueryFailedError } from 'typeorm';
import { Address } from 'src/common/entities/address.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ResponseService } from 'src/common/response.service';

@Injectable()
export class ClientsService {
  constructor(
    @Inject('CLIENT_REPOSITORY')
    private clientRepository: Repository<Client>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
    private responseService: ResponseService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });
    if (existingClient) {
      throw new ConflictException(
        this.responseService.fail({ message: 'The Client already exists.' }),
      );
    }

    const client = this.clientRepository.create(createClientDto);

    try {
      const newClient = await this.clientRepository.save(client);
      return this.responseService.success(newClient);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new HttpException(
          this.responseService.fail({
            message:
              'Database query error. Ensure all fields are valid and constraints are met.',
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        this.responseService.fail({
          message:
            'An unexpected error occurred while creating the client. Please try again later.',
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const clients = await this.clientRepository.find();
    return this.responseService.success(clients);
  }

  async findOne(id: number) {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new NotFoundException(
        this.responseService.fail({ message: 'Client not found' }),
      );
    }
    return this.responseService.success(client);
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    let client = await this.clientRepository.findOne({
      where: { id },
      relations: ['address'],
    });

    if (!client) {
      throw new NotFoundException(
        this.responseService.fail({ message: 'Client not found' }),
      );
    }

    if (updateClientDto.address_id !== undefined) {
      if (updateClientDto.address_id === null) {
        client.address = null;
        client.address_id = null;
      } else {
        const newAddress = await this.addressRepository.findOne({
          where: { id: updateClientDto.address_id },
        });
        if (!newAddress) {
          throw new NotFoundException(
            this.responseService.fail({ message: 'Address not found' }),
          );
        }
        client.address = newAddress;
        client.address_id = newAddress.id;
      }
    }

    Object.assign(client, updateClientDto);


    if (updateClientDto.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: updateClientDto.email },
      });
      if (existingClient && existingClient.id !== id) {
        throw new ConflictException(
          this.responseService.fail({
            message: `Email ${updateClientDto.email} is already in use.`,
          }),
        );
      }
    }

    const updatedClient = await this.clientRepository.save(client);
    return this.responseService.success(updatedClient);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    await this.clientRepository.delete({ id });
    return this.responseService.success(client);
  }

  async findByEmail(email: string) {
    const client = await this.clientRepository.findOneBy({ email });
    if (!client) {
      throw new NotFoundException(
        this.responseService.fail({ message: 'Client not found' }),
      );
    }
    return this.responseService.success(client);
  }

  async findByPhone(phoneNumber: string) {
    const client = await this.clientRepository.findOneBy({
      phone_number: phoneNumber,
    });
    if (!client) {
      throw new NotFoundException(
        this.responseService.fail({ message: 'Client not found' }),
      );
    }
    return this.responseService.success(client);
  }
}