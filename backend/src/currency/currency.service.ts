import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>, // Inject the Currency repository
  ) {}

  // Create a new currency
  async create(createCurrencyDto: CreateCurrencyDto) {
    // Check if a currency with the same name already exists
    const existingCurrency = await this.currencyRepository.findOne({
      where: { name: createCurrencyDto.name },
    });
    if (existingCurrency) {
      throw new ConflictException('The currency already exists.');
    }

    // Create and save the new currency
    const currency = this.currencyRepository.create(createCurrencyDto);
    try {
      return await this.currencyRepository.save(currency);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get all currencies
  async findAll() {
    return await this.currencyRepository.find();
  }

  // Get one currency by its ID
  async findOne(id: number) {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException('Currency not found.');
    }

    const purchaseRequestIds = currency.purchaseRequests.map(
      (purchaseRequest) => purchaseRequest.id,
    );
    delete currency.purchaseRequests;
    return { ...currency, purchaseRequestIds };
  }

  // Update a currency by its ID
  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException('Currency not found.');
    }

    // Apply updates to the currency
    Object.assign(currency, updateCurrencyDto);

    try {
      return await this.currencyRepository.save(currency);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Remove a currency by its ID
  async remove(id: number) {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException('Currency not found.');
    }

    await this.currencyRepository.remove(currency);
    return currency;
  }
}
