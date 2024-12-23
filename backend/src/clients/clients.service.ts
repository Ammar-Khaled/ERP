import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
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
    private responseService: ResponseService, // Inject ResponseService
  ) {}

  async create(createClientDto: CreateClientDto) {
    // Check if the client already exists
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });
    if (existingClient)
      throw new ConflictException('The Client already exists');

    // Create a new client entity
    const client = this.clientRepository.create(createClientDto);

    try {
      const newClient = await this.clientRepository.save(client);
      console.log('Client created.');

      // Only pass the data to responseService
      return this.responseService.success(newClient);  // Only passing data here
    } catch (error) {
      console.error('Error while saving client:', error);

      // Handle specific errors, if applicable
      if (error instanceof QueryFailedError) {

        throw new HttpException(
          this.responseService.fail(
            null,
            'Database query error. Ensure all fields are valid and constraints are met.',
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      // General error fallback
      throw new HttpException(
        this.responseService.error(
          'An unexpected error occurred while creating the client. Please try again later.',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const clients = await this.clientRepository.find();
    return this.responseService.success(clients);  // Only passing data here
  }

  async findOne(id: number) {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) throw new NotFoundException('Client not found');

    return this.responseService.success(client);  // Only passing data here
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    // Find the client entity
    let client = await this.clientRepository.findOne({
      where: { id },
      relations: ['address'], // Ensure address relation is loaded
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

  
    // Merge the updateClientDto with the existing client
    Object.assign(client, updateClientDto);
  
    // If address is provided in the updateClientDto, handle address update separately
    if (updateClientDto.address) {
      Object.assign(client.address, updateClientDto.address);
    }


    const updatedClient = await this.clientRepository.save(client);

    return this.responseService.success(updatedClient);  // Only passing data here
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    await this.clientRepository.delete({ id });
    console.log('Deleted a client.');

    return this.responseService.success(client);  // Only passing data here
  }

  // Find a client by email
  async findByEmail(email: string) {
    const client = await this.clientRepository.findOneBy({ email });
    console.log(email);
    if (!client) throw new NotFoundException('Client not found');

    return this.responseService.success(client);  // Only passing data here
  }

  // Find a client by phone number
  async findByPhone(phoneNumber: string) {
    const client = await this.clientRepository.findOneBy({ phone_number: phoneNumber });
    if (!client) throw new NotFoundException('Client not found');

    return this.responseService.success(client);  // Only passing data here
  }
}