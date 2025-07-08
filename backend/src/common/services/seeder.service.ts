import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

// Import all entity models
import { Address } from '../entities/address.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Currency } from '../../currency/entities/currency.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Client } from '../../clients/entities/client.entity';
import { Inventory } from '../../inventories/entities/inventory.entity';
import { Status } from '../../status/entities/status.entity';
import { Product } from '../../products/entities/product.entity';
import { Variation } from '../../variation/entities/variation.entity';
import { VariationOption } from '../../variation_option/entities/variation_option.entity';
import { ProductItem } from '../../product_item/entities/product_item.entity';
import { ProductItemToInventory } from '../../product_item_inventory/entities/product_item_inventory.entity';
import { PurchaseEntity } from '../../purchase_entity/entities/purchase_entity.entity';
import { PurchaseRequest } from '../../purchase_request/entities/purchase_request.entity';
import { PurchaseItem } from '../../purchase_request/entities/purchase_item.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { Order } from '../../order/entities/order.entity';
import { OrderItem } from '../../order/entities/order_item.entity';
import { Return } from '../../return/entities/return.entity';
import { ReturnItem } from '../../return/entities/return_item.entity';
import { ReturnPurchase } from '../../return_purchase/entities/return_purchase.entity';
import { ReturnPurchaseItem } from '../../return_purchase/entities/return_purchase_item.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { PurchaseInventory } from '../../purchase_inventory/entities/purchase_inventory.entity';

@Injectable()
export class SeederService {
  constructor(
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('ROLE_REPOSITORY')
    private roleRepository: Repository<Role>,
    @Inject('PERMISSION_REPOSITORY')
    private permissionRepository: Repository<Permission>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('UNIT_REPOSITORY')
    private unitRepository: Repository<Unit>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>,
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
    @Inject('CLIENT_REPOSITORY')
    private clientRepository: Repository<Client>,
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('STATUS_REPOSITORY')
    private statusRepository: Repository<Status>,
    @Inject('PRODUCT_REPOSITORY')
    private productRepository: Repository<Product>,
    @Inject('VARIATION_REPOSITORY')
    private variationRepository: Repository<Variation>,
    @Inject('VARIATION_OPTION_REPOSITORY')
    private variationOptionRepository: Repository<VariationOption>,
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepository: Repository<ProductItemToInventory>,
    @Inject('PURCHASE_ENTITY_REPOSITORY')
    private purchaseEntityRepository: Repository<PurchaseEntity>,
    @Inject('PURCHASE_REQUEST_REPOSITORY')
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    @Inject('PURCHASE_ITEM_REPOSITORY')
    private purchaseItemRepository: Repository<PurchaseItem>,
    @Inject('COUPON_REPOSITORY')
    private couponRepository: Repository<Coupon>,
    @Inject('ORDER_REPOSITORY')
    private orderRepository: Repository<Order>,
    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepository: Repository<OrderItem>,
    @Inject('RETURN_REPOSITORY')
    private returnRepository: Repository<Return>,
    @Inject('RETURN_ITEM_REPOSITORY')
    private returnItemRepository: Repository<ReturnItem>,
    @Inject('RETURN_PURCHASE_REPOSITORY')
    private returnPurchaseRepository: Repository<ReturnPurchase>,
    @Inject('RETURN_PURCHASE_ITEM_REPOSITORY')
    private returnPurchaseItemRepository: Repository<ReturnPurchaseItem>,
    @Inject('NOTIFICATION_REPOSITORY')
    private notificationRepository: Repository<Notification>,
    @Inject('PURCHASE_INVENTORY_REPOSITORY')
    private purchaseInventoryRepository: Repository<PurchaseInventory>,
  ) {
    // Faker is already configured with default locale
  }

  async translateIntoArabic(englishText: string) {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${englishText}&langpair=en|ar`,
      {
        method: 'GET',
      },
    );

    const data = await response.json();
    return data.responseData.translatedText || englishText;
  }

  // Generate demo addresses
  private async generateAddresses(count: number = 20): Promise<Address[]> {
    const addresses: Partial<Address>[] = [];

    for (let i = 0; i < count; i++) {
      const street = faker.location.streetAddress();
      const city = faker.location.city();
      const state = faker.location.state();
      const country = faker.location.country();

      addresses.push({
        street,
        streetAr: await this.translateIntoArabic(street),
        city,
        cityAr: await this.translateIntoArabic(city),
        state,
        stateAr: await this.translateIntoArabic(state),
        country,
        countryAr: await this.translateIntoArabic(country),
        zipCode: faker.location.zipCode(),
        longitude: faker.location.longitude(),
        latitude: faker.location.latitude(),
      });
    }

    return await this.addressRepository.save(addresses);
  }

  // Generate demo branches
  private async generateBranches(addresses: Address[]): Promise<Branch[]> {
    const branchNames = [
      'Main Branch',
      'Downtown Branch',
      'North Branch',
      'South Branch',
      'East Branch',
      'West Branch',
      'Airport Branch',
      'Mall Branch',
      'Industrial Branch',
      'Warehouse Branch',
    ];

    const branches = [];
    for (let index = 0; index < branchNames.length; index++) {
      const name = branchNames[index];
      branches.push({
        name,
        nameAr: await this.translateIntoArabic(name),
        description: `${name} - ${faker.company.catchPhrase()}`,
        descriptionAr: await this.translateIntoArabic(
          `${name} - ${faker.company.catchPhrase()}`,
        ),
        phone: faker.phone.number({ style: 'international' }),
        isActive: faker.datatype.boolean(0.9),
        address: addresses[index % addresses.length],
      });
    }

    return await this.branchRepository.save(branches);
  }

  // Generate demo currencies
  private async generateCurrencies(): Promise<Currency[]> {
    const currencyData = [
      { name: 'Egyptian Pound', symbol: 'EGP', nameAr: 'الجنيه المصري' },
      { name: 'US Dollar', symbol: '$', nameAr: 'الدولار الأمريكي' },
      { name: 'Euro', symbol: '€', nameAr: 'اليورو' },
      { name: 'British Pound', symbol: '£', nameAr: 'الجنيه الإسترليني' },
      { name: 'Saudi Riyal', symbol: 'SR', nameAr: 'الريال السعودي' },
      { name: 'UAE Dirham', symbol: 'AED', nameAr: 'الدرهم الإماراتي' },
    ];

    const currencies: Partial<Currency>[] = currencyData.map((curr) => ({
      name: curr.name,
      nameAr: curr.nameAr,
      symbol: curr.symbol,
    }));

    return await this.currencyRepository.save(currencies);
  }

  // Generate demo units
  private async generateUnits(): Promise<Unit[]> {
    const unitData = [
      {
        name: 'Piece',
        description: 'Individual item',
        nameAr: 'قطعة',
        descriptionAr: 'عنصر فردي',
      },
      {
        name: 'Box',
        description: 'Boxed items',
        nameAr: 'صندوق',
        descriptionAr: 'عناصر في صندوق',
      },
      {
        name: 'Kilogram',
        description: 'Weight measurement',
        nameAr: 'كيلوجرام',
        descriptionAr: 'قياس الوزن',
      },
      {
        name: 'Liter',
        description: 'Volume measurement',
        nameAr: 'لتر',
        descriptionAr: 'قياس الحجم',
      },
      {
        name: 'Meter',
        description: 'Length measurement',
        nameAr: 'متر',
        descriptionAr: 'قياس الطول',
      },
      {
        name: 'Pack',
        description: 'Packaged items',
        nameAr: 'علبة',
        descriptionAr: 'عناصر معبأة',
      },
    ];

    const units: Partial<Unit>[] = unitData.map((unit) => ({
      name: unit.name,
      nameAr: unit.nameAr,
      description: unit.description,
      descriptionAr: unit.descriptionAr,
      isActive: true,
    }));

    return await this.unitRepository.save(units);
  }

  // Generate demo users
  private async generateUsers(
    // roles: Role[],
    branches: Branch[],
    addresses: Address[],
  ): Promise<User[]> {
    const users: Partial<User>[] = [];

    for (let i = 0; i < 25; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.username({ firstName, lastName });

      users.push({
        username,
        email: faker.internet.email({ firstName, lastName }),
        password:
          '$2b$10$rHlKjFyWOsAH7lPeXoF8ROz.9Ft.NGXiYlhWt1WfHOLFGH7GZr3Jy', // hashed "password123"
        name: `${firstName} ${lastName}`,
        nameAr: await this.translateIntoArabic(`${firstName} ${lastName}`),
        phone: faker.phone.number({ style: 'international' }),
        isActive: faker.datatype.boolean(0.9),
        isBlocked: faker.datatype.boolean(0.1),
        address: faker.helpers.arrayElement(addresses),
        // roles: [faker.helpers.arrayElement(roles)],
        branch: faker.helpers.arrayElement(branches),
      });
    }

    return await this.userRepository.save(users);
  }

  // Generate demo suppliers
  private async generateSuppliers(addresses: Address[]): Promise<Supplier[]> {
    const suppliers: Partial<Supplier>[] = [];

    for (let i = 0; i < 15; i++) {
      const companyName = faker.company.name();

      suppliers.push({
        name: companyName,
        nameAr: await this.translateIntoArabic(companyName),
        email: faker.internet.email(),
        phone: faker.phone.number({ style: 'international' }),
        address: faker.helpers.arrayElement(addresses),
      });
    }

    return await this.supplierRepository.save(suppliers);
  }

  // Generate demo clients
  private async generateClients(addresses: Address[]): Promise<Client[]> {
    const clients: Partial<Client>[] = [];

    for (let i = 0; i < 30; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;

      clients.push({
        name: fullName,
        nameAr: await this.translateIntoArabic(fullName),
        email: faker.internet.email({ firstName, lastName }),
        phone_number: faker.phone.number({ style: 'international' }),
        address: faker.helpers.arrayElement(addresses),
      });
    }

    return await this.clientRepository.save(clients);
  }

  // Generate demo categories
  private async generateCategories(branches: Branch[]): Promise<Category[]> {
    const categoryNames = [
      'Electronics',
      'Clothing',
      'Food & Beverages',
      'Home & Garden',
      'Sports & Outdoors',
      'Books & Media',
      'Health & Beauty',
      'Automotive',
      'Toys & Games',
      'Office Supplies',
      'Tools & Hardware',
      'Jewelry',
      'Pet Supplies',
      'Baby & Kids',
      'Arts & Crafts',
    ];

    const categories = [];

    for (const name of categoryNames) {
      categories.push({
        name,
        nameAr: await this.translateIntoArabic(name),
        description: `${name} category with various products`,
        descriptionAr: await this.translateIntoArabic(
          `${name} category with various products`,
        ),
        branch: faker.helpers.arrayElement(branches),
      });
    }

    return await this.categoryRepository.save(categories);
  }

  // Generate demo inventories
  private async generateInventories(
    branches: Branch[],
    addresses: Address[],
  ): Promise<Inventory[]> {
    const inventories: Partial<Inventory>[] = [];

    for (const branch of branches) {
      // Create 1-3 inventories per branch
      const inventoryCount = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < inventoryCount; i++) {
        const inventoryName = `${branch.name} - Inventory ${i + 1}`;

        inventories.push({
          name: inventoryName,
          nameAr: await this.translateIntoArabic(inventoryName),
          isActive: faker.datatype.boolean(0.9),
          totalNumberOfValid: 0,
          totalNumberOfDamaged: 0,
          totalNumberOfPurchaseEntities: 0,
          address: faker.helpers.arrayElement(addresses),
          branch: branch,
        });
      }
    }

    return await this.inventoryRepository.save(inventories);
  }

  // Generate demo variations and variation options
  private async generateVariations(): Promise<{
    variations: Variation[];
    variationOptions: VariationOption[];
  }> {
    const variationData = [
      {
        name: 'Size',
        nameAr: 'الحجم',
        options: ['Small', 'Medium', 'Large', 'XL', 'XXL'],
      },
      {
        name: 'Color',
        nameAr: 'اللون',
        options: [
          'Red',
          'Blue',
          'Green',
          'Yellow',
          'Black',
          'White',
          'Gray',
          'Brown',
        ],
      },
      {
        name: 'Material',
        nameAr: 'المادة',
        options: [
          'Cotton',
          'Polyester',
          'Wool',
          'Silk',
          'Leather',
          'Metal',
          'Plastic',
          'Wood',
        ],
      },
      {
        name: 'Brand',
        nameAr: 'العلامة التجارية',
        options: ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E'],
      },
    ];

    const variations: Partial<Variation>[] = variationData.map((varData) => ({
      name: varData.name,
      nameAr: varData.nameAr,
    }));

    const savedVariations = await this.variationRepository.save(variations);

    const variationOptions: Partial<VariationOption>[] = [];
    savedVariations.forEach((variation, index) => {
      variationData[index].options.forEach((optionValue) => {
        variationOptions.push({
          value: optionValue,
          variation: variation,
        });
      });
    });

    const savedVariationOptions =
      await this.variationOptionRepository.save(variationOptions);

    return {
      variations: savedVariations,
      variationOptions: savedVariationOptions,
    };
  }

  // Generate demo products
  private async generateProducts(
    branches: Branch[],
    categories: Category[],
    units: Unit[],
    currencies: Currency[],
  ): Promise<Product[]> {
    const products: Partial<Product>[] = [];

    for (let i = 0; i < 50; i++) {
      const productName = faker.commerce.productName();

      products.push({
        name: productName,
        nameAr: await this.translateIntoArabic(productName),
        brand: faker.company.name(),
        isActive: faker.datatype.boolean(0.9),
        branch: faker.helpers.arrayElement(branches),
        category: faker.helpers.arrayElement(categories),
        unit: faker.helpers.arrayElement(units),
        currency: faker.helpers.arrayElement(currencies),
      });
    }

    return await this.productRepository.save(products);
  }

  // Generate demo product items
  private async generateProductItems(
    products: Product[],
    variationOptions: VariationOption[],
  ): Promise<ProductItem[]> {
    const productItems: Partial<ProductItem>[] = [];

    for (const product of products) {
      // Generate 1-5 product items per product
      const itemCount = faker.number.int({ min: 1, max: 5 });

      for (let i = 0; i < itemCount; i++) {
        const cost = faker.number.float({
          min: 10,
          max: 1000,
          multipleOf: 0.01,
        });
        const price =
          cost * faker.number.float({ min: 1.2, max: 3.0, multipleOf: 0.01 }); // 20% to 200% markup

        productItems.push({
          barcode: faker.string.numeric(12),
          cost: cost,
          price: price,
          totalNumberOfValid: 0,
          totalNumberOfDamaged: 0,
          name: `${product.name} - Variant ${i + 1}`,
          nameAr: await this.translateIntoArabic(
            `${product.name} - Variant ${i + 1}`,
          ),
          mainPhoto: faker.image.url({ width: 400, height: 400 }),
          expiryDate: faker.date.future({ years: 2 }),
          product: product,
          photos: Array.from(
            { length: faker.number.int({ min: 1, max: 5 }) },
            () => faker.image.url({ width: 400, height: 400 }),
          ),
          variationOptions: faker.helpers.arrayElements(
            variationOptions,
            faker.number.int({ min: 1, max: 3 }),
          ),
        });
      }
    }

    return await this.productItemRepository.save(productItems);
  }

  // Generate demo purchase entities
  private async generatePurchaseEntities(): Promise<PurchaseEntity[]> {
    const purchaseEntities: Partial<PurchaseEntity>[] = [];

    for (let i = 0; i < 30; i++) {
      const entityName = faker.commerce.productName();

      purchaseEntities.push({
        name: entityName,
        nameAr: await this.translateIntoArabic(entityName),
        description: faker.commerce.productDescription(),
        descriptionAr: await this.translateIntoArabic(
          faker.commerce.productDescription(),
        ),
        unitPrice: faker.number.float({ min: 5, max: 500, multipleOf: 0.01 }),
      });
    }

    return await this.purchaseEntityRepository.save(purchaseEntities);
  }

  // Generate demo coupons
  private async generateCoupons(): Promise<Coupon[]> {
    const coupons: Partial<Coupon>[] = [];

    for (let i = 0; i < 5; i++) {
      const startDate = faker.date.recent();
      const endDate = faker.date.future({ years: 1, refDate: startDate });

      coupons.push({
        name: faker.commerce.productAdjective() + ' Discount',
        code: faker.string.alphanumeric(8).toUpperCase(),
        startDate: startDate,
        endDate: endDate,
        discountPercentage: faker.number.float({
          min: 5,
          max: 50,
          multipleOf: 0.1,
        }),
        maxAllowed: faker.number.int({ min: 10, max: 1000 }),
        currentUsage: 0,
        numberOfUsageTimePerUser: faker.number.int({ min: 1, max: 5 }),
        minInvoiceTotal: faker.number.float({
          min: 50,
          max: 500,
          multipleOf: 0.01,
        }),
        isActive: faker.datatype.boolean(0.8),
      });
    }

    return await this.couponRepository.save(coupons);
  }

  // Main seeder method
  async seedDatabase(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      // 1. Generate foundational data
      console.log('Generating addresses...');
      const addresses = await this.generateAddresses(50);

      console.log('Generating branches...');
      const branches = await this.generateBranches(addresses);

      console.log('Generating currencies...');
      const currencies = await this.generateCurrencies();

      console.log('Generating units...');
      const units = await this.generateUnits();

      // 2. Generate user-related data
      console.log('Generating users...');
      const users = await this.generateUsers(branches, addresses);

      console.log('Generating suppliers...');
      const suppliers = await this.generateSuppliers(addresses);

      console.log('Generating clients...');
      const clients = await this.generateClients(addresses);

      // 3. Generate inventory and product data
      console.log('Generating inventories...');
      const inventories = await this.generateInventories(branches, addresses);

      console.log('Generating categories...');
      const categories = await this.generateCategories(branches);

      console.log('Generating variations and options...');
      const { variationOptions } = await this.generateVariations();

      console.log('Generating products...');
      const products = await this.generateProducts(
        branches,
        categories,
        units,
        currencies,
      );

      console.log('Generating product items...');
      const productItems = await this.generateProductItems(
        products,
        variationOptions,
      );

      console.log('Generating purchase entities...');
      const purchaseEntities = await this.generatePurchaseEntities();

      console.log('Generating coupons...');
      const coupons = await this.generateCoupons();

      // 4. Generate product-inventory relationships
      // console.log('Generating product-inventory relationships...');
      // await this.generateProductItemInventoryRelations(
      //   productItems,
      //   inventories,
      // );

      // 5. Generate purchase requests and related data
      console.log('Generating purchase requests...');
      await this.generatePurchaseRequests(
        users,
        branches,
        suppliers,
        inventories,
        purchaseEntities,
      );

      // 6. Generate orders and related data
      console.log('Generating orders...');
      await this.generateOrders(
        branches,
        inventories,
        users,
        clients,
        coupons,
        currencies,
        productItems,
      );

      console.log('Generating notifications...');
      await this.generateNotifications(users);

      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  // Helper method for product-inventory relationships
  private async generateProductItemInventoryRelations(
    productItems: ProductItem[],
    inventories: Inventory[],
  ): Promise<void> {
    const relations: Partial<ProductItemToInventory>[] = [];

    productItems.forEach((productItem) => {
      // Add each product item to 1-3 inventories
      const selectedInventories = faker.helpers.arrayElements(
        inventories,
        faker.number.int({ min: 1, max: Math.min(3, inventories.length) }),
      );

      selectedInventories.forEach((inventory) => {
        relations.push({
          productItem: productItem,
          inventory: inventory,
          numberOfValid: faker.number.int({ min: 1, max: 500 }),
          numberOfDamaged: faker.number.int({ min: 0, max: 50 }),
          minimumThreshold: faker.number.int({ min: 10, max: 100 }),
        });
      });
    });

    await this.productItemInventoryRepository.save(relations);
  }

  // Helper method for purchase requests
  private async generatePurchaseRequests(
    users: User[],
    branches: Branch[],
    suppliers: Supplier[],
    inventories: Inventory[],
    purchaseEntities: PurchaseEntity[],
  ): Promise<void> {
    const purchaseRequests: Partial<PurchaseRequest>[] = [];

    // Generate 10 purchase requests
    for (let i = 0; i < 10; i++) {
      purchaseRequests.push({
        date: faker.date.recent({ days: 90 }),
        totalPrice: 0, // Will be calculated by beforeInsert hook
        user: faker.helpers.arrayElement(users),
        branch: faker.helpers.arrayElement(branches),
        supplier: faker.helpers.arrayElement(suppliers),
        status: await this.statusRepository.findOne({
          where: { name: 'purchase_request_pending' },
        }),
        inventory: faker.helpers.arrayElement(inventories),
      });
    }

    const savedPurchaseRequests =
      await this.purchaseRequestRepository.save(purchaseRequests);

    // Generate purchase items for each request
    const purchaseItems: Partial<PurchaseItem>[] = [];

    savedPurchaseRequests.forEach((request) => {
      const itemCount = faker.number.int({ min: 1, max: 8 });

      for (let i = 0; i < itemCount; i++) {
        const numberOfItems = faker.number.int({ min: 1, max: 100 });
        const purchaseEntity = faker.helpers.arrayElement(purchaseEntities);
        const discount = faker.number.float({
          min: 1,
          max: 20,
          multipleOf: 0.01,
        });

        purchaseItems.push({
          purchaseEntity: purchaseEntity,
          numberOfItems: numberOfItems,
          discount: discount,
          totalPrice: 0, // Will be calculated by beforeInsert hook
          purchaseRequest: request,
        });
      }
    });

    await this.purchaseItemRepository.save(purchaseItems);
  }

  // Helper method for orders
  private async generateOrders(
    branches: Branch[],
    inventories: Inventory[],
    users: User[],
    clients: Client[],
    coupons: Coupon[],
    currencies: Currency[],
    productItems: ProductItem[],
  ): Promise<void> {
    const orders: Partial<Order>[] = [];

    // Generate 20 orders
    for (let i = 0; i < 20; i++) {
      orders.push({
        date: faker.date.recent({ days: 60 }),
        totalPrice: 0, // Will be calculated by beforeInsert hook
        branch: faker.helpers.arrayElement(branches),
        inventory: faker.helpers.arrayElement(inventories),
        user: faker.helpers.arrayElement(users),
        client: faker.helpers.arrayElement(clients),
        status: await this.statusRepository.findOne({
          where: { name: 'order_pending' },
        }),
        coupon: faker.datatype.boolean(0.3)
          ? faker.helpers.arrayElement(coupons)
          : null, // 30% chance of having a coupon
        currency: faker.helpers.arrayElement(currencies),
      });
    }

    const savedOrders = await this.orderRepository.save(orders);

    // Generate order items for each order
    const orderItems: Partial<OrderItem>[] = [];

    savedOrders.forEach((order) => {
      const itemCount = faker.number.int({ min: 1, max: 10 });

      for (let i = 0; i < itemCount; i++) {
        const productItem = faker.helpers.arrayElement(productItems);
        const numberOfItems = faker.number.int({ min: 1, max: 20 });
        const unitPrice =
          productItem.price ||
          faker.number.float({ min: 10, max: 500, multipleOf: 0.01 });

        orderItems.push({
          name: productItem.name,
          numberOfItems: numberOfItems,
          numberOfReturned: 0,
          unitPrice: unitPrice,
          totalPrice: numberOfItems * unitPrice,
          order: order,
          productItem: productItem,
        });
      }
    });

    const savedOrderItems = await this.orderItemRepository.save(orderItems);

    // Generate some returns for orders
    await this.generateReturns(savedOrders, savedOrderItems);
  }

  // Helper method for returns
  private async generateReturns(
    orders: Order[],
    orderItems: OrderItem[],
  ): Promise<void> {
    // Generate returns for 20% of orders
    const ordersToReturn = faker.helpers.arrayElements(
      orders,
      Math.floor(orders.length * 0.2),
    );

    const returns: Partial<Return>[] = ordersToReturn.map((order) => ({
      date: faker.date.between({
        from: order.date,
        to: new Date(),
      }),
      reason: faker.helpers.arrayElement([
        'Defective product',
        'Wrong item received',
        'Customer changed mind',
        'Size not fitting',
        'Product damaged during shipping',
      ]),
      reasonAr: faker.helpers.arrayElement([
        'منتج معيب',
        'تم استلام عنصر خاطئ',
        'العميل غير رأيه',
        'الحجم غير مناسب',
        'المنتج تضرر أثناء الشحن',
      ]),
      order: order,
      // status: faker.helpers.arrayElement(statuses),
    }));

    const savedReturns = await this.returnRepository.save(returns);

    // Generate return items
    const returnItems: Partial<ReturnItem>[] = [];

    savedReturns.forEach((returnRecord) => {
      const orderItemsForOrder = orderItems.filter(
        (item) => item.order.id === returnRecord.order.id,
      );
      const itemsToReturn = faker.helpers.arrayElements(
        orderItemsForOrder,
        faker.number.int({
          min: 1,
          max: Math.min(3, orderItemsForOrder.length),
        }),
      );

      itemsToReturn.forEach((orderItem) => {
        const maxReturnableItems =
          orderItem.numberOfItems - orderItem.numberOfReturned;
        const numberOfItemsToReturn = faker.number.int({
          min: 1,
          max: Math.max(1, maxReturnableItems),
        });

        returnItems.push({
          name: orderItem.name,
          numberOfItems: numberOfItemsToReturn,
          orderItem: orderItem,
          return: returnRecord,
        });
      });
    });

    await this.returnItemRepository.save(returnItems);
  }

  // Helper method for notifications
  private async generateNotifications(users: User[]): Promise<void> {
    const notificationTypes = [
      'low_inventory',
      'purchase_request_created',
      'purchase_request_approved',
      'purchase_request_rejected',
      'general',
    ];

    const notifications: Partial<Notification>[] = [];

    // Generate 20 notifications
    for (let i = 0; i < 20; i++) {
      const type = faker.helpers.arrayElement(notificationTypes);

      notifications.push({
        title: faker.helpers.arrayElement([
          'low_inventory',
          'purchase_request_created',
          'purchase_request_approved',
          'purchase_request_rejected',
          'general',
        ]),
        message: faker.lorem.sentences(2),
        type: type as any,
        user: faker.datatype.boolean(0.8)
          ? faker.helpers.arrayElement(users)
          : null, // 80% chance of being user-specific
        isRead: faker.datatype.boolean(0.4), // 40% chance of being read
        createdAt: faker.date.recent({ days: 30 }),
        relatedEntityId: faker.datatype.boolean(0.6)
          ? faker.number.int({ min: 1, max: 100 })
          : null,
        relatedEntityType: faker.datatype.boolean(0.6)
          ? faker.helpers.arrayElement([
              'order',
              'purchase_request',
              'inventory',
              'product',
            ])
          : null,
      });
    }

    await this.notificationRepository.save(notifications);
  }
}
