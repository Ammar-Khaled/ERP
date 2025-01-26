import { Test, TestingModule } from '@nestjs/testing';
import { ProductItemInventoryController } from './product_item_inventory.controller';
import { ProductItemInventoryService } from './product_item_inventory.service';

describe('ProductItemInventoryController', () => {
  let controller: ProductItemInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductItemInventoryController],
      providers: [ProductItemInventoryService],
    }).compile();

    controller = module.get<ProductItemInventoryController>(ProductItemInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
