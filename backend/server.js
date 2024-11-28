const express = require("express");
const cors = require("cors");
const { getCollection } = require("./db"); // Importa `getCollection`

const app = express();
const port = 4000; // Puerto donde se ejecuta el backend

// Middleware
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
    res.send("Bienvenido a la API de la base de datos");
});

// Ruta para obtener todos los documentos de una colección
app.get("/:collectionName", async (req, res) => {
    try {
        const collectionName = req.params.collectionName; // Nombre de la colección
        const collection = await getCollection(collectionName);
        const documents = await collection.find().toArray(); // Obtener todos los documentos
        res.json(documents);
    } catch (error) {
        console.error(`Error al obtener documentos de la colección ${req.params.collectionName}:`, error);
        res.status(500).json({ error: `Error al obtener datos de ${req.params.collectionName}` });
    }
});

// Ruta para agregar un documento a una colección
app.post("/:collectionName", async (req, res) => {
    try {
        const collectionName = req.params.collectionName; // Nombre de la colección
        const document = req.body; // Documento enviado por el cliente
        const collection = await getCollection(collectionName);
        const result = await collection.insertOne(document); // Insertar el documento
        res.status(201).json(result);
    } catch (error) {
        console.error(`Error al insertar documento en la colección ${req.params.collectionName}:`, error);
        res.status(500).json({ error: `Error al insertar datos en ${req.params.collectionName}` });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
