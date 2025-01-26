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
import * as jsend from 'jsend';

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
      throw new ConflictException(
        jsend.fail({ message: 'The currency already exists.' }),
      );
    }

    // Create and save the new currency
    const currency = this.currencyRepository.create(createCurrencyDto);
    try {
      const newCurrency = await this.currencyRepository.save(currency);
      return jsend.success(newCurrency);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message: 'An unexpected error occurred while creating the currency.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get all currencies
  async findAll() {
    const currencies = await this.currencyRepository.find();
    return jsend.success(currencies);
  }

  // Get one currency by its ID
  async findOne(id: number) {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(
        jsend.fail({ message: 'Currency not found.' }),
      );
    }

    return jsend.success(currency);
  }

  // Update a currency by its ID
  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(
        jsend.fail({ message: 'Currency not found.' }),
      );
    }

    // Apply updates to the currency
    Object.assign(currency, updateCurrencyDto);

    try {
      await this.currencyRepository.save(currency);
      return jsend.success(currency);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message: 'An unexpected error occurred while updating the currency.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Remove a currency by its ID
  async remove(id: number) {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(
        jsend.fail({ message: 'Currency not found.' }),
      );
    }

    await this.currencyRepository.remove(currency);
    return jsend.success(currency);
  }
}