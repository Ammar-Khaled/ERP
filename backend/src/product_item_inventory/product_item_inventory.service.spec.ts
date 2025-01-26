import { Test, TestingModule } from '@nestjs/testing';
import { ProductItemInventoryService } from './product_item_inventory.service';

describe('ProductItemInventoryService', () => {
  let service: ProductItemInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductItemInventoryService],
    }).compile();

    service = module.get<ProductItemInventoryService>(ProductItemInventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
