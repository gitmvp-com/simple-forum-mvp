import express from 'express';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new Database('forum.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reply_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );
`);

// Insert sample data if tables are empty
const topicCount = db.prepare('SELECT COUNT(*) as count FROM topics').get();
if (topicCount.count === 0) {
  const insertTopic = db.prepare('INSERT INTO topics (title, author) VALUES (?, ?)');
  const insertPost = db.prepare('INSERT INTO posts (topic_id, author, content) VALUES (?, ?, ?)');
  
  insertTopic.run('Welcome to Simple Forum!', 'Admin');
  insertPost.run(1, 'Admin', 'Welcome everyone! This is a simple forum where you can discuss various topics. Feel free to create new topics and join the conversation.');
  
  insertTopic.run('How to use this forum?', 'ForumUser');
  insertPost.run(2, 'ForumUser', 'I\'m new here. How do I create a new topic?');
  insertPost.run(2, 'Admin', 'Just click the "New Topic" button on the home page and fill in the form. It\'s that simple!');
  
  insertTopic.run('Feature Requests', 'Developer');
  insertPost.run(3, 'Developer', 'What features would you like to see in this forum?');
  
  // Update reply counts
  db.exec(`
    UPDATE topics SET reply_count = (
      SELECT COUNT(*) - 1 FROM posts WHERE posts.topic_id = topics.id
    )
  `);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// API Routes

// Get all topics
app.get('/api/topics', (req, res) => {
  const topics = db.prepare(`
    SELECT 
      t.*,
      (SELECT COUNT(*) FROM posts WHERE topic_id = t.id) as post_count
    FROM topics t 
    ORDER BY t.created_at DESC
  `).all();
  res.json(topics);
});

// Get single topic with all posts
app.get('/api/topics/:id', (req, res) => {
  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.id);
  
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  
  const posts = db.prepare(`
    SELECT * FROM posts 
    WHERE topic_id = ? 
    ORDER BY created_at ASC
  `).all(req.params.id);
  
  res.json({ topic, posts });
});

// Create new topic
app.post('/api/topics', (req, res) => {
  const { title, author, content } = req.body;
  
  if (!title || !author || !content) {
    return res.status(400).json({ error: 'Title, author, and content are required' });
  }
  
  const transaction = db.transaction(() => {
    const result = db.prepare('INSERT INTO topics (title, author) VALUES (?, ?)').run(title, author);
    const topicId = result.lastInsertRowid;
    
    db.prepare('INSERT INTO posts (topic_id, author, content) VALUES (?, ?, ?)').run(topicId, author, content);
    
    return topicId;
  });
  
  const topicId = transaction();
  res.status(201).json({ id: topicId, message: 'Topic created successfully' });
});

// Create new post (reply)
app.post('/api/topics/:id/posts', (req, res) => {
  const { author, content } = req.body;
  const topicId = req.params.id;
  
  if (!author || !content) {
    return res.status(400).json({ error: 'Author and content are required' });
  }
  
  const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(topicId);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  
  const transaction = db.transaction(() => {
    const result = db.prepare('INSERT INTO posts (topic_id, author, content) VALUES (?, ?, ?)').run(topicId, author, content);
    db.prepare('UPDATE topics SET reply_count = reply_count + 1 WHERE id = ?').run(topicId);
    return result.lastInsertRowid;
  });
  
  const postId = transaction();
  res.status(201).json({ id: postId, message: 'Post created successfully' });
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Forum running on http://localhost:${PORT}`);
});
