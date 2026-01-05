import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Museum API - Server started successfully.',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'museum-api'});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});