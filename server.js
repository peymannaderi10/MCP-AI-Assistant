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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.get('/openapi.json', (req,res)=>{
    res.json(swaggerDocs);
});

app.listen(PORT,()=>{
    console.log(`server running at http://localhost:${PORT}`);
});


/**
 * 
 * @swagger
 * /.well-known/mcp.json:
 *  get:
 *      summary: Model Context Protocol Manifest
 *      description: Provides information about this API for AI assistants
 *      responses:
 *          200:
 *              description: MCP Manifest 
 */
app.get('/.well-known/mcp.json', (req,res) => {
    const manifest ={
        schema_version: 'v1',
        name_for_human: 'Data Services API',
        name_for_model: 'data_services_api',
        description_for_human: 'Get Weather, IP geolocation, and stock market data.',
        description_for_model: 'Provides access to weather condistions, IP geolocation information, and stock market data. Use this API when users aks about weather forcasts, IP address locations, or stock prices.',
        auth:{
            type:'none'
        },
        api:{
            type:'openapi',
            url:`http://localhost:${PORT}/openapi.json`
        }
    };
    res.json(manifest);
});

// for compatibility with OpenAPI plugin format.
app.get('/.well-known/ai-plugin.json', (req,res)=>{
    res.redirect('/.well-known/mcp.json');
});


/**
 * @swagger
 * /api/weather/{location}:
 *  get:
 *     summary: Get current weather
 *     description: Retrieve current weather conditions for a specified location
 *     operationId: getCurrentWeather
 *     parameters:
 *         - in: path
 *          name: location
 *          required: true
 *          description: location to get weather for (city name, zip code, or coordinates)
 *          schema:
 *              type: string
 *     responses:
 *         200:
 *            description: Weather data for the specified location
 *         400:
 *            description: invalid location or api error
 */

app.get('/api/weather/:location', async (req, res) => {
    const location = req.params.location;

    try {
      const response = await axios.get(`http://api.weatherstack.com/current`, {
        params:{
            access_key: WEATHERSTACK_API_KEY,
            query: location
        }
      });

      if(response.data.error){
        return res.status(400).json({error: response.data.error.info});
      }

      return res.json(response.data);

    }catch(error){
        console.error('Error fetching weather data:',error);
        return res.status(500).json({error: 'failed to getch weather data'});
    }
});

/**
 * @swagger
 * /api/ip/{ipAddress}:
 *  get:
 *      summary: Get Ip geoLocation
 *      description: Retrieve geolocation data for a specified IP address
 *      operationId: getIPGeolocation
 *      parameters:
 *          - in: path
 *          name: ipAdress
 *          required: true
 *          description: IP address to look up
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Geolocation data for the specified IP
 *          400:
 *              description: invalid IP address or API error
 */
app.get('/api/ip/:ipAddress', async (req,res) => {

    const ipAddress = req.params.ipAddress;

    try {
        const response = await axios.get(`http://api.ipstack.com/${ipAddress}`, {
            params:{
                access_key: IPSTACK_API_KEY
            }
        });

        if(response.data.error){
            return res.status(400).json({error: response.data.error.info});
        }

        return res.json(response.data);
    } catch (error) {
        console.error('Error fetching IP data:', error);
        return res.status(500).json({error: 'failed to getch ip data'});
        
    }
});


/**
 * @swagger
 * /api/stock/{symbol}:
 *  get:
 *      summary: Get stock data
 *      description: Retrieve latest stock price and information for a specified symbol
 *      operationId: getStockData
 *      parameters:
 *          - in: path
 *          name: symbol
 *          required: true
 *          description: stock symbol to look up (e.g., AAPL, MSFT)
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Stock data for the specified symbol
 *          400:
 *              description: invalid symbol or api error
 */
app.get('/api/stock/:symbol', async (req,res) =>{
    const symbol = req.params.symbol;

    try {
        const response = await axios.get(`https://api.marketstack.com/v2/eod/latest`, {
            params:{
                access_key: MARKETSTACK_API_KEY,
                symbols: symbol
            }
        });

        if(response.data.error){
            return res.status(400).json({error: response.data.error.message});
        }

        return res.json(response.data);
    } catch (error) {
        console.error('Error fetching stock data', error);
        return res.status(500).json({error: 'Failed to fetch stock data'});
    }
});

