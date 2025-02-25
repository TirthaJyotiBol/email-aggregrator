import express from "express";
import dotenv from "dotenv"
import emailRouter from "./routes/email.router.js";
import { startIMAPListener } from "./services/imap.connection.js";
import { checkElasticsearchConnection } from "./services/elasticsearch.connection.js";

dotenv.config();

let app = express();
app.use(express.json());


let PORT = process.env.PORT || 3000;

startIMAPListener();
app.use('/email',emailRouter);

app.get('/',(req,res)=>{
    res.send('hihihi')
})

app.listen(PORT,async (err)=>{
    if(err){
        console.log(err);
        return;
    }
    checkElasticsearchConnection();
    console.log(`Listening to port ${PORT}`);
    
})