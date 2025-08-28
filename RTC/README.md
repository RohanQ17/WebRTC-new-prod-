# NekoLive - WebRTC Video Calling App

A modern, mobile-responsive video calling application built with WebRTC and Agora SDK.

## Features

- 🎥 High-quality video calling
- 🎙️ Audio/video controls (mute/unmute)
- 📱 Mobile-responsive design
- 🏠 Room-based conversations
- 🌐 Cross-platform compatibility

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3, Vite
- **Backend**: Node.js, Express.js
- **WebRTC**: Agora.io SDK
- **Deployment**: Vercel

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RTC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Agora.io credentials in `.env`:
   - Get your `APP_ID` and `APP_CERTIFICATE` from [Agora Console](https://console.agora.io/)

4. **Run development server**
   ```bash
   # Terminal 1: Start backend
   node src/server.js
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: `https://localhost:3000`
   - Backend API: `http://localhost:8080`

## Deployment on Vercel

### Prerequisites
- Vercel account
- Agora.io account with project setup

### Steps

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the project**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? `N`
   - Project name: `nekolive` (or your preferred name)
   - Directory: `./` (current directory)

4. **Set environment variables in Vercel**
   
   In your Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `APP_ID`: Your Agora App ID
     - `APP_CERTIFICATE`: Your Agora App Certificate

5. **Redeploy** (after setting environment variables)
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via Git

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variables in project settings
   - Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_ID` | Your Agora.io Application ID | Yes |
| `APP_CERTIFICATE` | Your Agora.io Application Certificate | Yes |

## Project Structure

```
RTC/
├── src/
│   └── server.js          # Backend API server
├── styles/
│   ├── main.css          # Landing page styles
│   └── room.css          # Video room styles
├── images/               # Static assets
├── index.html           # Landing page
├── room.html           # Video calling interface
├── streams.js          # WebRTC client logic
├── vercel.json         # Vercel deployment config
├── vite.config.js      # Vite build configuration
└── package.json        # Project dependencies
```

## API Endpoints

- `GET /get_app_id/` - Get Agora App ID
- `GET /get_token/` - Generate Agora token
- `POST /create_member/` - Add member to room
- `GET /get_member/` - Get member info
- `POST /delete_member/` - Remove member from room
- `GET /health` - Health check

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 80+

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues related to:
- **Agora SDK**: Check [Agora Documentation](https://docs.agora.io/)
- **Vercel Deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **App Issues**: Create an issue in this repository
