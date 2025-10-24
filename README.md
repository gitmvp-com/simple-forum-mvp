# Simple Forum MVP

A lightweight, easy-to-use forum application built with Node.js, Express, and SQLite. This MVP demonstrates the core features of a discussion forum without the complexity of full-featured platforms.

## Features

✨ **Core Forum Features:**
- 📋 View all discussion topics
- ➕ Create new topics with initial post
- 💬 View topic details with all replies
- ✍️ Add replies to existing topics
- 🕐 Timestamps with relative time display
- 📊 Post count tracking

## Tech Stack

- **Backend**: Node.js (v18+) + Express.js
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla JavaScript (no framework dependencies)
- **Styling**: Custom CSS with responsive design

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gitmvp-com/simple-forum-mvp.git
cd simple-forum-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and visit:
```
http://localhost:3000
```

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## Project Structure

```
simple-forum-mvp/
├── server.js           # Express server and API routes
├── package.json        # Dependencies and scripts
├── forum.db           # SQLite database (auto-created)
├── public/
│   ├── index.html     # Main HTML page
│   ├── styles.css     # Styling
│   └── app.js         # Frontend JavaScript
└── README.md
```

## API Endpoints

### Get All Topics
```
GET /api/topics
```
Returns list of all topics with metadata.

### Get Topic Details
```
GET /api/topics/:id
```
Returns topic information and all posts.

### Create New Topic
```
POST /api/topics
Body: { title, author, content }
```
Creates a new topic with initial post.

### Add Reply to Topic
```
POST /api/topics/:id/posts
Body: { author, content }
```
Adds a new reply to an existing topic.

## Database Schema

### Topics Table
```sql
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reply_count INTEGER DEFAULT 0
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

## Sample Data

The application automatically creates sample topics and posts on first run to demonstrate functionality.

## Customization

### Change Port

Set the `PORT` environment variable:
```bash
PORT=8080 npm start
```

### Styling

Edit `public/styles.css` to customize the appearance. The current design uses:
- Purple gradient header (#667eea to #764ba2)
- Clean, modern card-based layout
- Responsive design for mobile devices

## MVP Scope

This is an MVP (Minimum Viable Product) focused on core forum functionality. The following features are intentionally omitted to keep it simple:

- ❌ User authentication/registration
- ❌ User profiles
- ❌ Editing/deleting posts
- ❌ Categories/tags
- ❌ Search functionality
- ❌ Markdown support
- ❌ File uploads
- ❌ Moderation tools
- ❌ Email notifications
- ❌ Pagination

## Future Enhancements

Potential features for future versions:
- User authentication system
- Rich text editor
- Search and filtering
- Topic categories
- User reputation/karma
- Post editing and deletion
- Admin moderation panel

## License

MIT License - feel free to use this project for learning or as a starting point for your own forum!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Inspired By

This project was inspired by [Discourse](https://github.com/discourse/discourse), a popular open-source discussion platform.

---

**Built with ❤️ as a Simple Forum MVP**
