const { MongoClient } = require("mongodb");

// Configuración de conexión
const url = "mongodb://localhost:27017"; // Cambia si el puerto o IP son diferentes
const dbName = "chatApp"; // Nombre de tu base de datos

let dbInstance;

async function connectDB() {
    if (dbInstance) return dbInstance; // Reutiliza la conexión existente

    try {
        const client = new MongoClient(url, { useUnifiedTopology: true });
        await client.connect();
        console.log("Conectado a MongoDB");
        dbInstance = client.db(dbName); // Guarda la instancia de la base de datos
        return dbInstance;
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
        throw error;
    }
}

// Función para obtener una colección específica
async function getCollection(collectionName) {
    const db = await connectDB();
    return db.collection(collectionName); // Devuelve la colección solicitada
}

module.exports = { connectDB, getCollection };
