import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

//for form
app.use(express.json({ limit: "16kb" }))
//from url
app.use(urlencoded({ extended: true, limit: "16kb" }))
//public asset
app.use(express.static("public"))
//cookie
app.use(cookieParser())

export default app;