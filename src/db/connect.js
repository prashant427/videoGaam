import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js';
import dotenv from 'dotenv';



    async function connectDB() {
        try {
            const connectionInstence = await mongoose.connect(`${process.env.DB_HOST}/i${DB_NAME}`, {
            });
            console.log('Database connected successfully');
            console.log(connectionInstence.connection.host);
            
        }
             catch (error) {
            console.error('Error connecting to database', error);
            throw new Error("Error connecting to database", error);
            
        }

            }

    export default connectDB ;