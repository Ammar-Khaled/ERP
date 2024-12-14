import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): import("./clients.service").Client;
    findAll(): object;
    findOne(id: string): object;
    findByEmail(email: string): object;
    findByPhone(phone: string): object;
    update(id: string, updateClientDto: UpdateClientDto): import("./clients.service").Client;
    remove(id: string): string;
}
