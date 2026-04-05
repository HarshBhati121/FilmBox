# FilmBox

## Environment Variables Setup

You need to configure the environment variables in both the Backend and Frontend directories. Do not commit your API keys.

### Backend (`Backend/.env`)
Create a `.env` file in the `Backend` directory and add the following:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=        # <-- INSERT YOUR TMDB API KEY HERE
```

### Frontend (`Frontend/.env`)
Create a `.env` file in the `Frontend` directory and add the following:
```env
VITE_API_BASE=/api
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

## Dependencies to Install

Make sure you install the new frontend dependencies:
```bash
cd Frontend
npm install react-hot-toast react-router-dom lucide-react
```
*Note: `lucide-react` is recommended for icons if you are following modern design practices, and `react-hot-toast` is required for notifications.*
