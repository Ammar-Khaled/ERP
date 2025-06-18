# ERP Backend System

A comprehensive Enterprise Resource Planning (ERP) backend built with NestJS, providing a robust API for business operations management.

## Overview

This ERP backend system provides a complete set of APIs for managing various aspects of business operations including:

- User management: 
- Inventory management: 
- Order processing: 
- Client management
- Product management
- Branch management
- Purchase management
- Supplier management
- Coupon and discount management
- Currency and pricing features

## Design Challenges and Solutions

Our ERP system addresses these challenges by following best practices in software design and development, including modular architecture, RESTful API design, and robust testing strategies.

1- **Modular, Scalable, and Maintainable Architecture**: The system is designed with a modular architecture, allowing for easy addition of new features and modules in the future. Each module is responsible for a specific business domain, making it easier to manage and maintain the codebase. Main modules include Authentication, Authorization by Role-Based Access Control, Users, Products, Inventories, Orders, Clients, Suppliers, Purchases, and Accounting.

2- **User-Friendly Interface**: The system is designed with a focus on usability and user experience, providing a seamless interface for users to interact with the system. The interface is intuitive and easy to understand unlike the traditional ERP systems which are often complex and difficult to navigate.

3- **User Training**: The system provides intelligent AI agent to assist users in understanding how to use the system effectively. The AI agent can answer questions, provide guidance, and help users navigate the system.

4- **Localization**: The system supports Arabic and English languages and any currency the system may require for transactions.

5- **RESTful API Design**: The API follows RESTful principles, providing a clear and consistent interface for interacting with the system. Each endpoint is designed to perform a specific action, making it easy for developers to understand and use.

6- **Monitoring and Logging**: The system includes monitoring and logging features to track system performance and identify issues quickly. This helps in maintaining the health of the system and ensuring that any issues are addressed promptly. It also sends real-time notifications to the admins when any issue occurs.

7- **Reporting and Analytics**: Providing an informative dashboard, robust reporting and analytics features for managers to help businesses make informed decisions. The system includes built-in reporting capabilities, allowing users to generate reports on various aspects of their business operations.

8- **Data Privacy**: Our ERP system is designed with data privacy in mind. Enterprise sensitive data is stored on premise databases and access is restricted to authorized users only. Data is handled in compliance with privacy regulations and best practices.

9- **Robust Testing Strategies**: The system incorporates comprehensive testing strategies using Jest for unit tests, integration tests, and end-to-end tests, to ensure the reliability and stability of the application.


10- **Continuous Integration and Deployment (CI/CD)**: The project implements CI/CD pipelines using GitHub Actions to automate the build, test, and deployment processes, enhancing development efficiency and code quality.

## Technology Stack

- **Framework**: NestJS (v10)
- **Language**: TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger
- **Testing**: Jest
- **PDF Generation**: Puppeteer with Handlebars

## USER EXPERIENCE and USER INTERFACE
Utilizing the latest technologies, Figma, Adobe XD, React, and Tailwind CSS, we have created a user-friendly interface that is easy to navigate and understand. The interface is designed to be intuitive and user-friendly, allowing users to quickly access the features they need. The home screen provides a clear overview of the system's status, including real-time updates on inventory levels, order processing, and other key metrics. The interface is designed to be responsive and adaptable to different screen sizes, ensuring that users can access the system from any device. The interface is designed to be customizable, allowing users to tailor the system to their preferences.
Figma design link: [Figma Design](https://www.figma.com/design/j3NVikcyI5G9b8nBcsT2xp/Grad-Project)

## Project Structure

The project follows a modular architecture where each business domain has its own module:

- **Auth**: Authentication and authorization
- **Users**: User management with roles and permissions
- **Products**: Product catalog management
- **Inventory**: Stock management across branches
- **Orders**: Order processing and management
- **Clients**: Customer information management
- **Suppliers**: Supplier management
- **Purchases**: Purchase order management
- **Returns**: Product return processing
- **Categories**: Product categorization
- **Coupons**: Discount management
- **Currency**: Multi-currency support

## CONCLUSION AND FUTURE DIRECTIONS 
The ERP backend system is designed to be a comprehensive solution for managing business operations. It addresses the challenges faced by traditional ERP systems and provides a user-friendly, scalable, and maintainable architecture. The system is built with best practices in mind, ensuring that it is robust, secure, and easy to use. We are planning to add more features and modules in the future, including the classic Customer Relationship Management (CRM) features and peave the way for more AI features to be added in the future. 


## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=erp_db
JWT_SECRET=your_secret_key
```

4. Start the development server
```bash
npm run start:dev
```

### Database Configuration

This project uses TypeORM. The database connection is configured in the `src/common/database.providers.ts` file.

## API Documentation

The API is documented using Swagger. Once the application is running, you can access the Swagger UI at:
```
http://localhost:3000/api/v1/docs/swagger
```

## API Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "statusCode": 200,
  "isSuccess": true,
  "message": "Success",
  "data": {}
}
```

### Error Response
```json
{
  "statusCode": 400,
  "isSuccess": false,
  "message": "Error message",
  "data": null
}
```

## Testing

Run unit tests:
```bash
npm test
```

Run end-to-end tests:
```bash
npm run test:e2e
```

Run test coverage:
```bash
npm run test:cov
```

## Scripts

- `npm run build`: Compile the TypeScript code
- `npm run format`: Format code using Prettier
- `npm run start`: Start the application
- `npm run start:dev`: Start the application in watch mode
- `npm run start:debug`: Start with debugging
- `npm run start:prod`: Start in production mode
- `npm run lint`: Lint the code
- `npm run typeorm`: Run TypeORM commands

## License

This project is licensed under the UNLICENSED License.

