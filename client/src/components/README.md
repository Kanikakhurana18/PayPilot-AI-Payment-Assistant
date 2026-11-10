# PayPilot – AI-Powered Payment Assistant

PayPilot is an AI-powered payment management platform designed to help small businesses and freelancers manage invoices, track payments, monitor cash flow, and recover pending payments more efficiently.

It combines payment management with AI-driven insights and intelligent payment reminders to simplify everyday financial operations.

## Key Features

- **Business Dashboard:** View revenue, successful payments, pending invoices, and recent transactions.
- **Customer Management:** Create, view, update, and manage customer records.
- **Invoice Management:** Generate and track invoices with payment statuses and due dates.
- **PayPal Integration:** Create PayPal checkout orders and capture payments using PayPal Sandbox.
- **AI Business Insights:** Get AI-generated insights based on business payment activity.
- **AI Assistant:** Ask questions about invoices, payments, and business performance.
- **AI Payment Reminders:** Generate personalized payment reminder messages.
- **Payment Recovery Copilot:** Get AI-powered recommendations for following up on outstanding invoices.
- **Analytics:** Visualize revenue and payment trends.
- **Authentication:** Secure signup, login, and user-specific business data.
- **Responsive UI:** Access the dashboard on desktop and mobile devices.

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

**AI Integration**
- OpenRouter API
- OpenAI GPT-4o-mini model

**Payment Integration**
- PayPal REST API
- PayPal Sandbox

## Project Structure

```text
PayPilot/
├── client/              # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── assets/
│
├── server/              # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account
- PayPal Developer Sandbox account
- OpenRouter API key

### 1. Clone the repository

```bash
git clone https://github.com/Kanikakhurana18/PayPilot-AI-Payment-Assistant.git

cd PayPilot-AI-Payment-Assistant
```

### 2. Setup the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
OPENROUTER_API_KEY=your_openrouter_api_key
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

`http://localhost:8000`

### 3. Setup the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local Vite URL shown in your terminal, usually:

`http://localhost:5173`

## AI Implementation

PayPilot uses the OpenRouter API with the `openai/gpt-4o-mini` model.

AI capabilities include:

- Business payment insights based on invoice and payment records.
- Conversational assistance for business payment-related questions.
- Personalized payment reminder generation.
- Recommendations for recovering outstanding payments.

The backend retrieves business data for the authenticated user and uses relevant information as context for AI responses.

## PayPal Integration

PayPilot integrates PayPal REST APIs for payment processing.

The application creates PayPal checkout orders, redirects users to the PayPal Sandbox approval page, and captures approved payments through the backend.

**Note:** The current integration uses PayPal Sandbox for testing and demonstration purposes. It does not process live payments.

## Security

- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected API routes.
- User-specific customer, invoice, payment, and AI data access.
- API credentials stored in environment variables.

## Future Improvements

- Live payment processing.
- Automated payment follow-ups.
- Advanced cash-flow forecasting.
- More detailed financial analytics.
- Additional business integrations.

## Author

**Kanika Khurana**

GitHub: https://github.com/Kanikakhurana18

LinkedIn: https://www.linkedin.com/in/kanikakhurana18/

---

Built for the PayPal AI Hackathon 2026.