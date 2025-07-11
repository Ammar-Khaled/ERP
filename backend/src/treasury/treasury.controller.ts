import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { CreateTreasuryDto } from './dto/create-treasury.dto';
import { UpdateTreasuryDto } from './dto/update-treasury.dto';

@Controller('treasuries')
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get()
  findAll(@Query('active') active?: string, @Query('type') type?: string) {
    return this.treasuryService.findAll({ active, type });
  }

  @Post()
  create(@Body() dto: CreateTreasuryDto) {
    return this.treasuryService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treasuryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTreasuryDto) {
    return this.treasuryService.update(+id, dto);
  }
}
