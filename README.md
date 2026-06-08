# Comprehensive ERP System with AI Integration

A robust, full-stack Enterprise Resource Planning (ERP) system featuring a NestJS backend, a Next.js frontend, an AI-powered RAG chatbot (ERBot), and an OCR service for automated invoice processing.

## Overview

This ERP system addresses modern business operations by combining traditional ERP modules with advanced Artificial Intelligence features. It provides a complete set of APIs and user interfaces for managing various aspects of business operations, along with AI assistants and automated data entry.

### Key Features

1. **Modular Architecture**: Built with a highly scalable, maintainable modular structure.
2. **Comprehensive Management**: Covers Users, Inventory, Orders, Clients, Products, Branches, Purchases, Suppliers, and more.
3. **ERBot (AI Assistant)**: A Retrieval-Augmented Generation (RAG) chatbot using Pinecone and DeepSeek to provide intelligent responses based on ERP capabilities and technical documents.
4. **Automated OCR Service**: Uses PaddleOCR to automatically extract supplier information, currencies, and purchase items from uploaded invoices and receipts.
5. **Localization**: Supports multiple languages (including Arabic and English) and various currencies.
6. **Role-Based Access Control (RBAC)**: Secure access management tailored for different enterprise roles.
7. **Reporting and Analytics**: Built-in reporting capabilities for real-time insights and informed decision-making.

## Design Challenges and Solutions

Our ERP system addresses these challenges by following best practices in software design and development, including modular architecture, RESTful API design, and robust testing strategies.

1. **Modular, Scalable, and Maintainable Architecture**: The system is designed with a modular architecture, allowing for easy addition of new features and modules in the future. Each module is responsible for a specific business domain, making it easier to manage and maintain the codebase. Main modules include Authentication, Authorization by Role-Based Access Control, Users, Products, Inventories, Orders, Clients, Suppliers, Purchases, and Accounting.

2. **User-Friendly Interface**: The system is designed with a focus on usability and user experience, providing a seamless interface for users to interact with the system. The interface is intuitive and easy to understand unlike the traditional ERP systems which are often complex and difficult to navigate.

3. **User Training**: The system provides intelligent AI agent to assist users in understanding how to use the system effectively. The AI agent can answer questions, provide guidance, and help users navigate the system.

4. **Localization**: The system supports Arabic and English languages and any currency the system may require for transactions.

5. **RESTful API Design**: The API follows RESTful principles, providing a clear and consistent interface for interacting with the system. Each endpoint is designed to perform a specific action, making it easy for developers to understand and use.

6. **Monitoring and Logging**: The system includes monitoring and logging features to track system performance and identify issues quickly. This helps in maintaining the health of the system and ensuring that any issues are addressed promptly. It also sends real-time notifications to the admins when any issue occurs.

7. **Reporting and Analytics**: Providing an informative dashboard, robust reporting and analytics features for managers to help businesses make informed decisions. The system includes built-in reporting capabilities, allowing users to generate reports on various aspects of their business operations.

8. **Data Privacy**: Our ERP system is designed with data privacy in mind. Enterprise sensitive data is stored on premise databases and access is restricted to authorized users only. Data is handled in compliance with privacy regulations and best practices.

9. **Robust Testing Strategies**: The system incorporates comprehensive testing strategies using Jest for unit tests, integration tests, and end-to-end tests, to ensure the reliability and stability of the application.

10. **Continuous Integration and Deployment (CI/CD)**: The project implements CI/CD pipelines using GitHub Actions to automate the build, test, and deployment processes, enhancing development efficiency and code quality.

## USER EXPERIENCE and USER INTERFACE

Utilizing the latest technologies, Figma, Adobe XD, React, and Tailwind CSS, we have created a user-friendly interface that is easy to navigate and understand. The interface is designed to be intuitive and user-friendly, allowing users to quickly access the features they need. The home screen provides a clear overview of the system's status, including real-time updates on inventory levels, order processing, and other key metrics. The interface is designed to be responsive and adaptable to different screen sizes, ensuring that users can access the system from any device. The interface is designed to be customizable, allowing users to tailor the system to their preferences.
Figma design link: [Figma Design](https://www.figma.com/design/j3NVikcyI5G9b8nBcsT2xp/Grad-Project)

## System Architecture

The project is divided into four main components, each housed in its respective directory:

### 1. Backend (`/backend`)
- **Framework**: NestJS (v10)
- **Language**: TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger
- **Testing**: Jest
- **PDF Generation**: Puppeteer with Handlebars

#### Backend Modules Structure
The backend follows a modular architecture where each business domain has its own module:
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


### 2. Frontend (`/frontend`)
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Design UI**: Figma / Adobe XD

### 3. ERBot
- **Repository**: [https://github.com/Ammar-Khaled/erbot](https://github.com/Ammar-Khaled/erbot)
- **Framework**: Python
- **AI/ML**: LangChain, Pinecone Vector DB, DeepSeek LLM, BAAI/bge-small-en-v1.5 embeddings
- **Functionality**: RAG chatbot for retrieving domain-specific ERP knowledge from internal documentation.

### 4. OCR Service
- **Repository**: [https://github.com/Ammar-Khaled/OCR](https://github.com/Ammar-Khaled/OCR)
- **Framework**: Python (Flask)
- **AI/ML**: PaddleOCR
- **Functionality**: Extracts tabular and entity data from invoices and sends it to the backend to automatically create purchase requests.

## Getting Started

### Prerequisites

- **Node.js**: v14 or higher (for frontend and backend)
- **Python**: 3.8+ (for ERBot and OCR service)
- **MySQL**: v8 or higher
- **npm**

### Installation & Setup

#### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in `backend/` based on `.env.sample`.
4. Run the development server: `npm run start:dev`
5. API Documentation is available at: `http://localhost:8080/api/v1/docs/swagger`


#### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the web app at `http://localhost:3000`

#### ERBot Setup
1. Clone ERBot repository: `git clone https://github.com/Ammar-Khaled/erbot.git`
2. Navigate to the ERBot directory: `cd erbot`
3. Create and activate a virtual environment: `python -m venv venv` and `.\venv\Scripts\Activate.ps1`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.template` to `.env` and fill in your Pinecone API keys and GitHub tokens.
6. Ingest documents: `python pinecone_ingestion.py`
7. Start the chatbot: `python app.py`

#### OCR Service Setup
1. Clone the OCR repository: `git clone https://github.com/Ammar-Khaled/OCR.git`
2. Navigate to the OCR directory: `cd OCR`
3. Create and activate a virtual environment (recommended).
4. Install the required PaddleOCR and Flask dependencies (e.g., `pip install paddleocr flask flask-cors requests`).
5. Run the Flask application: `python app.py` (Runs on port 4000)

## API Response Format (Backend)

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

## Conclusion and Future Directions

The ERP system is designed to be a comprehensive solution for managing business operations. It addresses the challenges faced by traditional ERP systems and provides a user-friendly, scalable, and maintainable architecture. 

In the future, we plan to:
- Expand Customer Relationship Management (CRM) features.
- Integrate more advanced AI features, such as predictive analytics for inventory and sales forecasting.
