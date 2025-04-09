require ('dotenv').config();
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express();

//Middlewear to handle CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

//Middleware
app.use(express.json());

//Routes

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));