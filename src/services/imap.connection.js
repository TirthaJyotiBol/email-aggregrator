import Imap from "imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
import { ImapHelper } from "./imap.helpers.js";
import { esClient } from "./elasticsearch.connection.js";
import { emailExistsInElasticsearch } from "./elasticsearch.connection.js";
import { storeEmailInElasticsearch } from "./elasticsearch.connection.js";


dotenv.config();
let imapHelper = new ImapHelper();

export function startIMAPListener() {
    const IMAP_CONFIG = {
        user: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        port: Number(process.env.IMAP_PORT) || 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { rejectUnauthorized: false }
    };

    const imap = new Imap(IMAP_CONFIG);

    imap.once("ready", () => {
        console.log("IMAP Connection Ready!");

        imap.openBox("INBOX", false, (err, box) => {
            if (err) {
                console.error("Error opening inbox:", err);
                return;
            }

            // Listen for new emails
            imap.on("mail", (numNewEmails) => {

                console.log(` New email received! Fetching latest email... (${numNewEmails})`);

                const fetchOptions = { bodies: "", markSeen: false };
                const fetch = imap.seq.fetch(`${box.messages.total || 1}:*`, fetchOptions);

                fetch.on("message", (msg) => {
                    msg.on("body", async (stream) => {
                        const parsed = await simpleParser(stream);
                        const emailData = {
                            from: parsed.from.text,
                            subject: parsed.subject,
                            date: parsed.date,
                            body: parsed.text,
                        };

                        const exists = await emailExistsInElasticsearch(emailData);

                        if (!exists) {
                            console.log("Email stored in Elasticsearch");
                            await storeEmailInElasticsearch(emailData);
                        } else {
                            console.log("Email already exists in Elasticsearch");
                        }


                    });
                });

            });



        });
    });

    imap.once("error", (err) => console.error("❌ IMAP Error:", err));
    imap.once("end", () => console.log("❌ IMAP Connection Ended"));
    
    imap.connect();
}
