require('dotenv').config();
const express = require('express');
const app = express();


const connectDB =require('./db/index.js')

connectDB();

