import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export interface Client {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    address_id: number;
}
export declare class ClientsService {
    private clients;
    private nextId;
    create(createClientDto: CreateClientDto): Client;
    findAll(): object;
    findOne(id: number): object;
    findByEmail(email: string): object;
    findByPhone(phoneNumber: string): object;
    update(id: number, updateClientDto: UpdateClientDto): Client | undefined;
    remove(id: number): string;
}
