// App State
let currentView = 'topics';
let currentTopicId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showTopicsList();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  document.getElementById('new-topic-form').addEventListener('submit', handleNewTopic);
}

// View Management
function showView(viewName) {
  document.querySelectorAll('.view').forEach(view => {
    view.style.display = 'none';
  });
  document.getElementById(`${viewName}-view`).style.display = 'block';
  currentView = viewName;
}

function showTopicsList() {
  showView('topics');
  loadTopics();
}

function showNewTopicForm() {
  showView('new-topic');
  document.getElementById('new-topic-form').reset();
}

function showTopicDetail(topicId) {
  currentTopicId = topicId;
  showView('topic');
  loadTopicDetail(topicId);
}

// API Calls
async function loadTopics() {
  const container = document.getElementById('topics-list');
  container.innerHTML = '<div class="loading">Loading topics...</div>';
  
  try {
    const response = await fetch('/api/topics');
    const topics = await response.json();
    
    if (topics.length === 0) {
      container.innerHTML = '<div class="loading">No topics yet. Create the first one!</div>';
      return;
    }
    
    container.innerHTML = topics.map(topic => `
      <div class="topic-item" onclick="showTopicDetail(${topic.id})">
        <div class="topic-title">${escapeHtml(topic.title)}</div>
        <div class="topic-meta">
          <span>👤 ${escapeHtml(topic.author)}</span>
          <span>💬 ${topic.post_count} ${topic.post_count === 1 ? 'post' : 'posts'}</span>
          <span>🕐 ${formatDate(topic.created_at)}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = '<div class="loading">Error loading topics. Please try again.</div>';
    console.error('Error loading topics:', error);
  }
}

async function loadTopicDetail(topicId) {
  const container = document.getElementById('topic-detail');
  container.innerHTML = '<div class="loading">Loading topic...</div>';
  
  try {
    const response = await fetch(`/api/topics/${topicId}`);
    const data = await response.json();
    
    container.innerHTML = `
      <div class="topic-header">
        <h2>${escapeHtml(data.topic.title)}</h2>
        <div class="topic-meta">
          <span>Started by ${escapeHtml(data.topic.author)}</span>
          <span>•</span>
          <span>${formatDate(data.topic.created_at)}</span>
        </div>
      </div>
      
      <div class="posts">
        ${data.posts.map(post => `
          <div class="post">
            <div class="post-header">
              <span class="post-author">${escapeHtml(post.author)}</span>
              <span class="post-date">${formatDate(post.created_at)}</span>
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="reply-form">
        <h3>Add a Reply</h3>
        <form id="reply-form" onsubmit="handleNewReply(event)">
          <div class="form-group">
            <label for="reply-author">Your Name</label>
            <input type="text" id="reply-author" required placeholder="Your username">
          </div>
          <div class="form-group">
            <label for="reply-content">Your Reply</label>
            <textarea id="reply-content" required placeholder="Write your reply..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Post Reply</button>
        </form>
      </div>
    `;
  } catch (error) {
    container.innerHTML = '<div class="loading">Error loading topic. Please try again.</div>';
    console.error('Error loading topic:', error);
  }
}

// Form Handlers
async function handleNewTopic(e) {
  e.preventDefault();
  
  const title = document.getElementById('topic-title').value;
  const author = document.getElementById('topic-author').value;
  const content = document.getElementById('topic-content').value;
  
  try {
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, content })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showTopicDetail(result.id);
    } else {
      alert('Error creating topic: ' + result.error);
    }
  } catch (error) {
    alert('Error creating topic. Please try again.');
    console.error('Error creating topic:', error);
  }
}

async function handleNewReply(e) {
  e.preventDefault();
  
  const author = document.getElementById('reply-author').value;
  const content = document.getElementById('reply-content').value;
  
  try {
    const response = await fetch(`/api/topics/${currentTopicId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      loadTopicDetail(currentTopicId);
    } else {
      alert('Error posting reply: ' + result.error);
    }
  } catch (error) {
    alert('Error posting reply. Please try again.');
    console.error('Error posting reply:', error);
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
