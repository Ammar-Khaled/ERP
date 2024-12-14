"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
let ClientsService = class ClientsService {
    constructor() {
        this.clients = [];
        this.nextId = 1;
    }
    create(createClientDto) {
        const newClient = {
            id: this.nextId++,
            ...createClientDto,
        };
        this.clients.push(newClient);
        return newClient;
    }
    findAll() {
        return {
            Clients: this.clients,
        };
    }
    findOne(id) {
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
    findByEmail(email) {
        const client = this.clients.find(client => client.email === email);
        if (!client) {
            return {
                message: `Client with email ${email} not found`,
            };
        }
        return {
            Client: client,
        };
    }
    findByPhone(phoneNumber) {
        const client = this.clients.find(client => client.phone_number === phoneNumber);
        if (!client) {
            return {
                message: `Client with phone number ${phoneNumber} not found`,
            };
        }
        return {
            Client: client,
        };
    }
    update(id, updateClientDto) {
        const clientIndex = this.clients.findIndex(client => client.id === id);
        if (clientIndex === -1) {
            throw new Error(`Client with ID ${id} not found`);
        }
        const updatedClient = { ...this.clients[clientIndex], ...updateClientDto };
        this.clients[clientIndex] = updatedClient;
        return updatedClient;
    }
    remove(id) {
        const clientIndex = this.clients.findIndex(client => client.id === id);
        if (clientIndex === -1) {
            throw new Error(`Client with ID ${id} not found`);
        }
        this.clients.splice(clientIndex, 1);
        return `Client with ID ${id} has been removed`;
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)()
], ClientsService);
//# sourceMappingURL=clients.service.js.map