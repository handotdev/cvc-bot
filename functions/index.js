const functions = require('firebase-functions');
const axios = require('axios');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');

// Time on every day Mon-Fri at 10 AM EST
exports.scheduleFunction = functions.pubsub.schedule('0 18 * * *')
    .timeZone('America/New_York')
    .onRun(() => {
        return sendMessage();
    });

function sendMessage() {
    getTopNews()
        .then((res) => {

            const d = new Date();

            const dateString = `${['January', 'February', 'March', 'April', 
            'May', 'June', 'July', 'August', 'September', 'October', 
            'November', 'December'][d.getMonth()]} ${d.getDate()}`;

            let header = `*Top Hacker News Articles on ${dateString}*`;
            
            // Set up timer
            TimeAgo.addLocale(en);
            const timeAgo = new TimeAgo('en-US');

            const attachments = res.map((news, i) => {
                return {
                    "text": `:speech_balloon: ${news.title}\n_${timeAgo.format(news.time*1000)}_`,
                        "actions": [
                            {
                                "type": "button",
                                "text": "Read Article",
                                "url": news.url,
                                "style": "primary"
                            }
                        ],
                        "fallback": `Test link button to ${news.url}`,
                }
            })

            return axios.post('https://hooks.slack.com/services/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', 
            {
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": header
                    }
                  },
                ],
                  "attachments": attachments
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