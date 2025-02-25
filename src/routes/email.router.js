import express from "express";
// import {imapConnection} from "../services/imap.connection.js";
import { ImapHelper } from "../services/imap.helpers.js";
import { getEmails } from "../services/elasticsearch.connection.js";

let emailRouter = express.Router();
let imapHelper = new ImapHelper();

// emailRouter.get('/sync', async (req,res)=>{
//     return res.json({
//         'message':'hi'
//     })
// });

emailRouter.get('/getmails', async (req,res)=>{
    getEmails(req,res);
});

export default emailRouter;