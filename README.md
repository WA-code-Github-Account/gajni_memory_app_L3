# Gajni Memory App

A Progressive Web App (PWA) for managing memories and tasks with offline support, voice input, and cloud synchronization using Supabase.

## Features

- **Voice Input**: Add memories using speech recognition in English or Urdu
- **Text-to-Speech**: Listen to your memories aloud
- **Offline Support**: Works seamlessly without internet connection
- **Cloud Sync**: Synchronize memories with Supabase database (with local storage fallback)
- **Search Functionality**: Find memories quickly with search
- **Task Management**: Mark memories as completed
- **Responsive Design**: Works on mobile and desktop devices
- **PWA Capabilities**: Installable on devices like a native app

## Technologies Used

- React 19
- Vite (with rolldown-vite)
- Supabase (for cloud storage)
- Web Speech API (for voice recognition and synthesis)
- PWA (Progressive Web App) capabilities

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WA-code-Github-Account/gajni_memory_app_L3.git
cd gajni_memory_app_L3
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Supabase Configuration

To use cloud synchronization, you need to set up a Supabase project:

1. Create a new project at [Supabase](https://supabase.com)
2. Create the memories table with the following SQL:
```sql
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Create a policy for authenticated users to view their own memories
CREATE POLICY "Users can view own memories" ON memories
FOR SELECT TO authenticated
USING (true);

-- Create a policy for authenticated users to insert their own memories
CREATE POLICY "Users can insert own memories" ON memories
FOR INSERT TO authenticated
WITH CHECK (true);

-- Create a policy for authenticated users to update their own memories
CREATE POLICY "Users can update own memories" ON memories
FOR UPDATE TO authenticated
USING (true);

-- Create a policy for authenticated users to delete their own memories
CREATE POLICY "Users can delete own memories" ON memories
FOR DELETE TO authenticated
USING (true);
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add the environment variables in the Vercel dashboard
4. Deploy!

### Build for Production

To create a production build:

```bash
npm run build
```

The build will be created in the `dist` directory.

## Usage

1. Type your memory in the input field or click the microphone button to speak
2. Choose your preferred language (English or Urdu) for voice recognition
3. Click "Add Memory" to save your memory
4. Search through your memories using the search bar
5. Mark memories as completed using the checkbox
6. Listen to memories using the "Speak" button
7. Delete memories using the "Delete" button

## Error Handling

- If Supabase environment variables are missing, the app will fall back to local storage
- If Supabase tables don't exist, a warning will be shown but the app will continue to work
- Network errors during Supabase operations won't interrupt the user experience

## Browser Compatibility

- Chrome/Chromium-based browsers (recommended)
- Firefox (partial support for speech features)
- Safari (limited support for speech features)

Note: Speech recognition and synthesis features may not be available in all browsers.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Vite](https://vite.dev/) and [React](https://react.dev/)
- Cloud storage powered by [Supabase](https://supabase.com/)
- Icons from [PWA icons](https://web.dev/define-uses-appropriate-protocol/)

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.