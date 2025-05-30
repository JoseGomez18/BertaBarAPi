const connectDB = require('../config/db.js');

async function createTables() {
    const db = await connectDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tblProductos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio_compra REAL NOT NULL,
            precio_venta REAL NOT NULL,
            cantidad INTEGER NOT NULL,
            fecha_vencimiento TEXT NOT NULL,
            categoria_id INTEGER,
            FOREIGN KEY (categoria_id) REFERENCES tblCategorias(id) ON DELETE SET NULL
        );


        CREATE TABLE IF NOT EXISTS tblVentas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            fecha TEXT DEFAULT (datetime('now')),
            totalVenta REAL DEFAULT 0,
            servicio REAL DEFAULT 0,
            estado TEXT CHECK(estado IN ('pendiente', 'completado', 'por deber')) DEFAULT 'pendiente'
        );

            CREATE TABLE IF NOT EXISTS tblCategorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS tblDetalles_venta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            venta_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario REAL NOT NULL,
            subtotal REAL NOT NULL,
            servicio REAL DEFAULT 0,
            FOREIGN KEY (venta_id) REFERENCES tblVentas(id),
            FOREIGN KEY (producto_id) REFERENCES tblProductos(id)
        );
    `);

    console.log("Tablas creadas correctamente ✅");
    await db.close();
}

// Ejecutar la función para crear las tablas
createTables().catch(err => console.error(err));
