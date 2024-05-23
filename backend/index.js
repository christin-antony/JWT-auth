import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './router/router.js';

const app = express();
const port = 8001;

app.use(cors());
app.use(express.json());
app.use("/", router);

mongoose.connect("mongodb+srv://christin:ouHLMYZXHEP6B58i@cluster0.golc87t.mongodb.net/Form-db")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error);
    });

app.listen(port, () => {
    console.log("Server started on port", port);
});
