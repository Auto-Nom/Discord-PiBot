const Discord = require("discord.js");
const dota = require("./dota.js");
const fs = require("fs");

const config = require("./config.json");
const responses = require("./responses.json");
var SteamIDs = JSON.parse(fs.readFileSync("./PlayerIDs.json"));

// Initialize the bot
const bot = new Discord.Client();

bot.on("message", msg => {

    // Ignore message if it doesn't start with!, or is from another bot
    if (!msg.content.startsWith("!")) return;
    if (msg.author.bot) return;

    // test command to delete at some stage
    if (msg.content.startsWith("!name")) {
        let [...name] = msg.content.split(" ").slice(1);
        msg.reply(`Hello ${name.toString().replace(/,/g, " ")}`);
    }

    // add a steam ID for the user
    if (msg.content.startsWith("!steamID")) {
        var steamID = msg.content.split(" ").slice(1)[0];
        SteamIDs[msg.author.username] = steamID;
        fs.writeFile("./PlayerIDs.json", JSON.stringify(SteamIDs), (err) => {
            if (err) console.error(err);
        });
        msg.reply("Steam ID added!");
    }

    // roll dice specifying upper limit, upper and lower, or none which is 1-100
    if (msg.content.startsWith("!roll")) {
        let args = msg.content.split(" ").slice(1);
        var roll;
        if (args.length === 2) {
            roll = dice(parseInt(args[0]), parseInt(args[1]));
        } else if (args.length == 1) {
            roll = dice(1, parseInt(args[0]));
        } else {
            roll = dice(0, 100);
        }
        msg.reply("rolled: " + roll);
    }

    // display a string with the KDA, hero, duration, and victory status of your last match
    if (msg.content.startsWith("!mymatch")) {
        if (SteamIDs[msg.author.username]) {
            var pID = SteamIDs[msg.author.username];
            dota.MatchString(pID, function (err, response) {
                if (!err) {
                    msg.reply(response);
                } else {
                    msg.reply("Something went wrong :(");
                }
            });
        } else {
            msg.reply("I don't have your steamID :(");
        }
    }

    // display the heros with the highest of various stats from the last match
    if (msg.content.startsWith("!match")) {
        if (SteamIDs[msg.author.username]) {
            var mID = SteamIDs[msg.author.username];
            dota.LastMatch(mID, function (err, response) {
                if (!err) {
                    msg.channel.sendMessage(response);
                } else {
                    msg.channel.sendMessage("Something went wrong :(");
                }
            });
        } else {
            msg.reply("I don't have your steamID :(");
        }
    }

    // display a random quote from the responses file.
    if (msg.content.startsWith("!quote")) {
        let quote = responses["Quotes"][Math.floor(Math.random() * responses["Quotes"].length)];
        msg.channel.sendMessage(quote);
    }

    // commands with no arguments, and a set reply
    if (responses["Basic"][msg.content]) {
        msg.channel.sendMessage(responses["Basic"][msg.content]);
    }
});

// welcome new members
bot.on("guildMemberAdd", (member) => {
    member.guild.defaultChannel.sendMessage(`Welcome, ${member.user.username}!`);
});

// send a message when a user comes online
bot.on("presenceUpdate", function (omember, nmember) {
    if (nmember.presence.status === "online") {
        nmember.guild.defaultChannel.sendMessage(`@${nmember.user.username}, "Oh good, you're back! It's been too long since I bathed in human misery."`);
    }
    if (nmember.presence.game.name === "dota 2" || nmember.presence.game.name === "DOTA 2") {
        nmember.guild.defaultChannel.sendMessage("Okay, time to forget the myriad external pressures and life stresses that have driven you to blot out the pain with video games, let's play some Dota!");
    }
});

// when the bot comes online, send a message
bot.on("ready", () => {
    console.log("Ready for action.");
    bot.guilds.array().forEach(function(guild){
        guild.defaultChannel.sendMessage("PiBot ONLINE AND REPORTING FOR DUTY!");
    });
});

// log all errors, warnings, and info
bot.on("error", e => { console.console.error(e); });
bot.on("warn", e => {console.console.warn(e); });
bot.on("debug", e => {console.info(e); });

bot.login(config.token);

function dice(low=1, high=100) {
    return Math.floor(Math.random() * (high - low +1)) + low;
}
