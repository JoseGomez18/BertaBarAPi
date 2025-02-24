const express = require('express');
const cors = require('cors');
const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', productoRoutes);
app.use('/api', ventaRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`));
