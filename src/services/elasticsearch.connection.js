import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
    node: "http://localhost:9200"
});


export async function checkElasticsearchConnection() {
    try {
        // const health = await esClient.cluster.health();
        console.log("✅ Elasticsearch is up:");
    } catch (error) {
        console.error("❌ Error connecting to Elasticsearch:", error);
    }
}

export async function emailExistsInElasticsearch(emailData) {
    const { body } = await esClient.search({
        index: "emails",
        body: {
            query: {
                bool: {
                    must: [
                        { match: { from: emailData.from } },
                        { match: { subject: emailData.subject } },
                        { match: { date: emailData.date } },
                    ],
                },
            },
        },
    });

    return body.hits.total.value > 0;
}

export async function storeEmailInElasticsearch(emailData) {
    await esClient.index({
        index: "emails",
        body: emailData,
    });
}


// Function to fetch all stored emails
export async function getEmails(req,res) {
    try {
        const { body } = await esClient.search({
            index: "emails", // Index where emails are stored
            body: {
                query: {
                    match_all: {}, // Retrieves all emails
                },
            },
        });

        body.hits.hits.forEach((hit, index) => {
            console.log(`\n📬 Email ${index + 1}:`);
            console.log(`From: ${hit._source.from}`);
            console.log(`Subject: ${hit._source.subject}`);
            console.log(`Date: ${hit._source.date}`);
            console.log(`Body: ${hit._source.body}`);
        });

        return res.json({
            'status':true
        })

    } 
    catch (error) {
        console.log(error);
        
        return res.json({
            'status':false
        })
    }
}
