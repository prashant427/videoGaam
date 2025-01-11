import express, { urlencoded } from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({ origin: process.env.ORIGIN , credentials: true }))
app.use(express.json({limit : '10kb'}))
app.use(urlencoded({extended : true , limit : '10kb'}))
app.use(express.static('public'))
app.use(cookieParser())

//routes
import userRoutes from './routes/user.routes.js'

app.use('/user', userRoutes)


export { app }
