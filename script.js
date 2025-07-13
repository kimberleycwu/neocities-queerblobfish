// Guestbook functionality for div.one using Firebase Realtime Database REST API
const FIREBASE_URL = 'https://neocities-guestbook-default-rtdb.firebaseio.com/posts.json';

// Utility: Format date/time
function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

// Render the guestbook UI
function renderGuestbookUI() {
  const oneDiv = document.querySelector('.one');
  oneDiv.innerHTML = `
    <div class="guestbook-flex">
      <div class="guestbook-form-col">
        <h1 style="margin: 0 0 20px 0;">not twitter</h1>
        <form id="guestbook-form">
          <input type="text" id="author" maxlength="32" placeholder="your name" required style="width: 100%; margin-bottom: 5px;" />
          <textarea id="content" maxlength="240" placeholder="leave a message (emojis supported)" required style="width: 100%; height: 60px; resize: none; margin-bottom: 5px;"></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span id="char-count">0/240</span>
            <button type="submit">Post</button>
          </div>
        </form>
      </div>
      <div class="guestbook-posts-col">
        <div id="posts-list"></div>
      </div>
    </div>
  `;

  // Character counter
  const contentInput = document.getElementById('content');
  const charCount = document.getElementById('char-count');
  contentInput.addEventListener('input', () => {
    charCount.textContent = `${contentInput.value.length}/240`;
  });

  // Form submit
  document.getElementById('guestbook-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('author').value.trim();
    const content = contentInput.value.trim();
    if (!author || !content || content.length > 240) return;
    await addPost({ author, content });
    contentInput.value = '';
    charCount.textContent = '0/240';
    fetchAndRenderPosts();
  });
}

// Add a post to Firebase
async function addPost({ author, content }) {
  const post = {
    author,
    content,
    timestamp: new Date().toISOString(),
  };
  await fetch(FIREBASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
}

// Fetch and render posts
async function fetchAndRenderPosts() {
  const res = await fetch(FIREBASE_URL);
  const data = await res.json();
  const posts = [];
  for (const id in data) {
    posts.push({ id, ...data[id] });
  }
  // Newest first
  posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const postsList = document.getElementById('posts-list');
  postsList.innerHTML = posts.map(post => `
    <div style="border-bottom: 1px solid #ccc; padding: 8px 0;">
      <div style="font-weight: bold; font-size: 18px;">${post.author}</div>
      <div style="white-space: pre-wrap;">${post.content}</div>
      <div style="font-size: 0.9em; color: #666;">${formatDateTime(post.timestamp)}</div>
    </div>
  `).join('');
}

// Initialize guestbook on page load
window.addEventListener('DOMContentLoaded', () => {
  renderGuestbookUI();
  fetchAndRenderPosts();
});
