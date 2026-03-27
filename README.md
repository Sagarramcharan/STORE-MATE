# Store Mate - Inventory & Sales Management System

Store Mate is a professional inventory and sales management application designed for small shopkeepers. It helps track stock levels, manage sales, and monitor product expiry dates in real-time.

## Features

- **Dashboard**: Real-time overview of total stock value, low stock alerts, and recent sales.
- **Inventory Management**: Add, update, and delete products with categories and expiry dates.
- **Sales Tracking**: Record sales transactions and automatically update stock levels.
- **Expiry Alerts**: Stay informed about products nearing their expiry date.
- **AI-Powered Insights**: Get smart recommendations and business insights using Gemini AI.
- **Secure Authentication**: User authentication powered by Firebase.
- **Real-time Sync**: Data is synced across devices using Firestore.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Express (for development preview), Firebase (Firestore & Auth).
- **AI**: Google Gemini API.
- **Deployment**: Vercel.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase Project

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd store-mate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_ID=your_database_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is optimized for deployment on **Vercel**.

1. Push your code to GitHub.
2. Connect your GitHub repository to Vercel.
3. Add the environment variables listed above in the Vercel dashboard.
4. Vercel will automatically build and deploy your application.

## License

This project is licensed under the MIT License.
