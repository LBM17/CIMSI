const jwt = require('jsonwebtoken');
const { mongoose } = require('../config/db');
const SECRET_KEY = 'secret123';

//NUEVO - LUISA
const User = require('../models/userModel'); 
const Chat = require('../models/chatModel'); 


// Función auxiliar para asegurar que la conexión esté lista
async function ensureDBConnected() {
  if (mongoose.connection.readyState !== 1) {
    console.log('Esperando conexión a la base de datos...');
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve); // Espera el evento 'connected'
    });
  }
}

// Controlador de registro de usuario
async function registerUser(req, res) {
  console.log("Datos recibidos en el registro:", req.body);
  try {
    await ensureDBConnected(); // Asegurar conexión
    const db = mongoose.connection.db; // Ahora debería estar conectado

    const { username, email, password } = req.body;

    // Comprobar si el email ya está registrado
    const existingUser = await db.collection('Users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Insertar el nuevo usuario con los datos proporcionados
    await db.collection('Users').insertOne({ 
      _id: new mongoose.Types.ObjectId(), // Genera un ID único
      username, 
      email, 
      password, 
      avatar: 'https://example.com/default-avatar.png', // Valor predeterminado para avatar
      status: 'offline', // Valor predeterminado para status
      createdAt: new Date(), // Fecha de creación del usuario
      blockedUsers: [], // Lista vacía para blockedUsers
      contacts: [] // Lista vacía para contacts
    });

    // Responder con éxito
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message || error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

// Controlador de inicio de sesión de usuario
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const db = mongoose.connection.db;

  try {
    // Buscar usuario en la base de datos
    const user = await db.collection('Users').findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    // Responder con el token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message || error);
    res.status(500).json({ error: 'Error en el inicio de sesión', details: error.message });
  }
};

// NUEVO LUISA - Obtener los contactos del usuario
const getUserContacts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(String (req.user.id));
    const user = await User.findById(userId).populate('contacts'); // Añadido populate

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Devolver solo los contactos
    return res.status(200).json(user.contacts); // Devolvemos únicamente los contactos del usuario
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los contactos' });
  }
};

// Obtener los chats del usuario
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id }).populate('members');
    return res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los chats' });
  }
};
module.exports = { registerUser, loginUser, getUserContacts, getUserChats};
