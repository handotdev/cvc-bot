const functions = require('firebase-functions');
const axios = require('axios');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Time on every day Mon-Fri at 10 AM EST
// exports.scheduleFunction = functions.pubsub.schedule('0 * * * 1-5')
//     .timeZone('America/New_York')
//     .onRun((context) => {
        
//         return null;
//     });

function sendMessage() {
    getTopNews()
        .then((res) => {
            let message = `Top Startup News for May 20`;
            res.forEach((news, i) => message += `\n${i+1}: <${news.url}|${news.title}>`)

            console.log(res);
            return axios.post('https://hooks.slack.com/services/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', 
            {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": message
                        }
                    },
                    {
                        "type": "section",
                        "block_id": "section567",
                        "text": {
                            "type": "mrkdwn",
                            "text": "<https://example.com|Overlook Hotel> \n :star: \n Doors had too many axe holes, guest in room 237 was far too rowdy, whole place felt stuck in the 1920s."
                        },
                        
                    },
                    {
                        "type": "section",
                        "block_id": "section789",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": "*Average Rating*\n1.0"
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-type': 'application/json'
                }
            })
        })
        .catch((err) => console.log(err))
}

function getTopNews() {
    return new Promise((resolve, reject) => {
        axios.get('https://hacker-news.firebaseio.com/v0/topstories.json')
        .then((res) => {
            const topNews = res.data;
            const newsNumber = 3;

            const articlePromises = [];
            for (let i = 0; i < newsNumber; i++) {
                articlePromises.push(getArticle(topNews[i]));
            }

            return Promise.all(articlePromises)
                .then((res) => {
                    return resolve(res);
                }).catch((err) => reject(err))
            
        }).catch((err) => reject(err));
    })
}

function getArticle(articleId) {
    return new Promise((resolve, reject) => {
        return axios.get(`https://hacker-news.firebaseio.com/v0/item/${articleId}.json?print=pretty`)
            .then((res) =>{
                return resolve(res.data);
            }).catch((err) => {
                return reject(err)
            })
    })
}

// function getThumbnail