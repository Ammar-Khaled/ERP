import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

// Define the Client type as an interface and export it for usage across files
export interface Client {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address_id: number;
}

@Injectable()
export class ClientsService {
  private clients: Client[] = []; // In-memory array to store clients
  private nextId = 1; // To simulate auto-incrementing IDs

  // Create a new client
  create(createClientDto: CreateClientDto): Client {
    const newClient: Client = {
      id: this.nextId++, // Auto-increment client ID
      ...createClientDto, // Assign other client data from DTO
    };
    this.clients.push(newClient); // Add the new client to the array
    return newClient;
  }

  // Find all clients 
  findAll(): object {
    return {
      Clients: this.clients, // Return the clients array with the label "Clients"
    };
  }

  // Find one client by ID
  findOne(id: number): object {
    const client = this.clients.find(client => client.id === id);
    if (!client) {
      return {
        message: `Client with ID ${id} not found`,
      };
    }
    return {
      Client: client, 
    };
  }

  // Find a client by email
  findByEmail(email: string): object {
    const client = this.clients.find(client => client.email === email);
    if (!client) {
      return {
        message: `Client with email ${email} not found`,
      };
    }
    return {
      Client: client, // Return the client with the label "Client"
    };
  }

  // Find a client by phone number
  findByPhone(phoneNumber: string): object {
    const client = this.clients.find(client => client.phone_number === phoneNumber);
    if (!client) {
      return {
        message: `Client with phone number ${phoneNumber} not found`,
      };
    }
    return {
      Client: client, // Return the client with the label "Client"
    };
  }

  // Update a client by ID
  update(id: number, updateClientDto: UpdateClientDto): Client | undefined {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      throw new Error(`Client with ID ${id} not found`);
    }
    const updatedClient = { ...this.clients[clientIndex], ...updateClientDto };
    this.clients[clientIndex] = updatedClient;
    return updatedClient;
  }

  // Remove a client by ID
  remove(id: number): string {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      throw new Error(`Client with ID ${id} not found`);
    }
    this.clients.splice(clientIndex, 1); // Remove the client from the array
    return `Client with ID ${id} has been removed`;
  }
}