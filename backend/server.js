// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const setupSocket = require('./socket');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('Backend funcionando');
});

connectDB().then(() => {
  console.log("Conexión establecida, iniciando el servidor...");
  // Solo arrancar el servidor después de que la conexión a MongoDB sea exitosa
  const cors = require('cors');
  app.use(cors({
    origin: 'http://localhost:5173', // Dirección del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true // Si necesitas enviar cookies o encabezados de autorización
  }));
  app.use(express.json());

  // Rutas
  app.use('/api/Users', userRoutes);
  app.use('/api/Chats', chatRoutes);

  // Configuración de Socket.IO
  setupSocket(io);

  const PORT = 3001;
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });

  app.use((req, res, next) => {
    console.log('Estado de la conexión:', mongoose.connection.readyState);
    next();
  });  

  const adminRoutes = require('./routes/adminRoutes');
  app.use('/admin', adminRoutes); // Ahora las rutas estarán bajo '/admin'
}).catch((error) => {
  console.error('Error al conectar con la base de datos:', error);
});
