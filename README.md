# Museum API

A RESTful API for a fictional museum website built with Express.js and TypeScript.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/I-Yanis-I/museum-api.git
cd museum-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## Project Structure
```
src/
├── controllers/    # Business logic
├── routes/         # API endpoints
├── models/         # Data schemas
├── middleware/     # Custom middleware
├── types/          # TypeScript interfaces
└── utils/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
```

## API Endpoints

### Health Check
- `GET /` - API status
- `GET /health` - Service health check

*More endpoints coming soon...*

## Testing

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.