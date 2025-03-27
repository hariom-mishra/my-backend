import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectDb from "./db/index.js";

const app = express();

connectDb();

/*
;( async () => {
 try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error) => {
        console.log("Error connecting to the database", error);
        throw error;
    })
    app.on("open", () => {
        console.log("Connected to the database successfully");
    })
 } catch (error) {
    console.log("Error connecting to the database", error);
    throw error;
 }
})*/
