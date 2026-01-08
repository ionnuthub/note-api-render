const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from React frontend
app.use(express.static('dist'));

// Middleware pentru logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de health check (CRITIC pentru Render)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Note API Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principală
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Notes API',
    description: 'Backend service for managing notes',
    version: '1.0.0',
    documentation: 'Check /health for service status',
    endpoints: {
      health: 'GET /health',
      getAllNotes: 'GET /api/notes',
      getNote: 'GET /api/notes/:id',
      createNote: 'POST /api/notes',
      deleteNote: 'DELETE /api/notes/:id'
    }
  });
});

// Simulare baza de date în memorie
let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
    date: new Date().toISOString()
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
    date: new Date().toISOString()
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
    date: new Date().toISOString()
  }
];

// Helper pentru generat ID
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0;
  return maxId + 1;
};

// GET all notes
app.get('/api/notes', (req, res) => {
  res.json(notes);
});

// GET single note
app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find(note => note.id === id);
  
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

// CREATE new note
app.post('/api/notes', (req, res) => {
  const body = req.body;
  
  if (!body.content) {
    return res.status(400).json({ 
      error: 'Content is required' 
    });
  }
  
  const note = {
    id: generateId(),
    content: body.content,
    important: body.important || false,
    date: new Date().toISOString()
  };
  
  notes = notes.concat(note);
  res.status(201).json(note);
});

// UPDATE note importance
app.put('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  
  const note = notes.find(note => note.id === id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  const updatedNote = { 
    ...note, 
    important: body.important !== undefined ? body.important : note.important
  };
  
  notes = notes.map(n => n.id === id ? updatedNote : n);
  res.json(updatedNote);
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  notes = notes.filter(note => note.id !== id);
  res.status(204).end();
});

// 404 handler pentru rute necunoscute
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/notes',
      'GET /api/notes/:id',
      'POST /api/notes',
      'PUT /api/notes/:id',
      'DELETE /api/notes/:id'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`📝 API: http://localhost:${PORT}/api/notes`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
