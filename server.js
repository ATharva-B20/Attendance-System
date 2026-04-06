const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
// Database Connection Pool
const pool = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME,
port: process.env.DB_PORT
});
// 1. Get all attendance records
app.get('/api/attendance', async (req, res) => {
try {
const [rows] = await pool.execute('SELECT * FROM students ORDER BY roll_no ASC');
res.json(rows);
} catch (error) {

res.status(500).json({ error: error.message });
}
});
// 2. Add a student (Default: Absent)
app.post('/api/attendance', async (req, res) => {
const { name, roll_no } = req.body;
try {
await pool.execute(
'INSERT INTO students (name, roll_no, status) VALUES (?, ?, "Absent")',
[name, roll_no]
);
res.json({ message: 'Success' });
} catch (error) {
res.status(500).json({ error: 'Roll number already exists' });
}
});
// 3. Toggle Status (Present/Absent)
app.put('/api/attendance/:id', async (req, res) => {
const { id } = req.params;
const { status } = req.body;
try {
await pool.execute('UPDATE students SET status = ? WHERE id = ?', [status, id]);
res.json({ message: 'Updated' });
} catch (error) {
res.status(500).json({ error: error.message });
}
});
// 4. Remove a student
app.delete('/api/attendance/:id', async (req, res) => {
try {
await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
res.json({ message: 'Deleted' });
} catch (error) {
res.status(500).json({ error: error.message });
}
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Attendance System running on port ${PORT}`));
