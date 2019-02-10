const Botkit = require('botkit');
const Config = require('./Config');

const controller = Botkit.slackbot({
    debug: false,
    json_file_store: Config.FILE_STORAGE_NAME
});

const bot = controller.spawn({
    token: process.env.BOT_TOKEN
}).startRTM()

const isProd = true;
// TODO Config化
if (isProd) {
    controller.configureSlackApp({
        clientId: Config.SLACK_CLIENT_ID,
        clientSecret: Config.SLACK_CLIENT_SECRET,
        scopes: ['commands']
    });

    controller.setupWebserver(process.env.PORT, (err, webserver) => {
        controller.createWebhookEndpoints(controller.webserver);
        controller.createOauthEndpoints(controller.webserver, (err, req, res) => {
            if (err) {
                res.status(500).send('Error: ' + JSON.stringify(err));
            } else {
                res.send('Success');
            }
        });
    });

    // teamIdをストレージに保存する
    bot.api.team.info({}, (err, response) => {
        if (err) throw new Error(err.stack || JSON.stringify(err));
        // FIX2 this is a workaround for https://github.com/howdyai/botkit/issues/590
        response.team.bot = {
            id: 'boti',
            name: 'boti'
        };
        // END FIX2
        controller.saveTeam(response.team, () => {
            // ignore
        })
    });
}

module.exports = {
    controller: controller
};
