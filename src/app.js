import express, { urlencoded } from "express";
import { requestBodyLimit, staticFileName } from "./constants.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({ limit: requestBodyLimit}))

app.use(urlencoded({extended: true, limit: requestBodyLimit}))
app.use(express.static(staticFileName))
app.use(cookieParser())

export default app;
