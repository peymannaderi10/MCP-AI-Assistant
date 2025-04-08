const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const exp = require('constants');
require('dotenv').config();

const app = express();
const PORT = 3000;


app.use(cors());
app.use(expess.json());
app.use(express.static('public'));

const WEATHERSTACK_API_KEY = process.env.WEATHERSTACK_API_KEY;
const IPSTACK_API_KEY = process.env.IPSTACK_API_KEY;
const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY;


const swaggerOptions = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:'AI-Ready API Gateway',
            version:'1.0.0',
            description:'API Gateway for AI assistants to access weather, IP and market data',   
        },
        servers:[
            {
                url: 'http://localhost:3000',
                description:'Development server',
            },
        ],
    },
    apis:['./server.js'],
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve,swaggerUi.setup(swaggerDocs));


app.get('/openapi.json', (req,res) => {

    res.json(swaggerDocs);
});

app.listen(PORT, () =>{
    console.log(`server running at http://localhost:${PORT}`)
})