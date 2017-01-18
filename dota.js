const request = require("request");
const fs = require("fs");
const config = require("./config.json");

// file mapping hero IDs to their names
const heroes = JSON.parse(fs.readFileSync("./heroes.json"));

// get the most recent match ID for a player
function SteamGetPlayer(playerID, callback) {
    var urlP = "https://api.steampowered.com/idota2match_570/getmatchhistory/v001/";
    var optionsP = {
        "key": config.SteamAPIKey,
        "account_id": playerID,
        "matches_requested": 1,
        "format": "json"
    };
    request.get({url:urlP, qs:optionsP}, function (err, response, body) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        if (response.statusCode == 200) {
            body = JSON.parse(body);
            // var matchData;
            var matchID = body["result"]["matches"][0]["match_id"];
            // SteamGetMatch(matchID, function(err, data){
            //     if (!err) {
            //         matchData = data;
            //     }
            // });
            callback(null, matchID);
        } else {
            console.log("STATUS: " + response.statusCode);
            callback(response.statusCode);
        }
    });
}

// get all the data for a given match ID
function SteamGetMatch(matchID, callback) {
    var urlM = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/";
    var optionsM = {
        "key": config.SteamAPIKey,
        "match_id": matchID
    };
    request.get({url:urlM, qs:optionsM}, function (err, response, body) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        if (response.statusCode == 200) {
            body = JSON.parse(body);
            callback(null, body);
        } else {
            console.log("STATUS: " + response.statusCode);
            callback(response.statusCode);
        }
    });
}

// return a string about the player's last match
function MatchString(player_id, callback) {
    SteamGetPlayer(player_id, function(err, mID){
        if (!err){
            SteamGetMatch(mID, function(err, data) {
                if (!err){
                    var player;
                    data["result"]["players"].forEach(function(elmt){
                        if (elmt["account_id"].toString() === player_id) {
                            player = elmt;
                        }
                    });
                    var hero = heroes[player["hero_id"].toString()];
                    var kills = player["kills"];
                    var assists = player["assists"];
                    var deaths = player["deaths"];
                    var duration = Math.round(data["result"]["duration"] / 60);
                    var playerSlot = player["player_slot"];
                    var team = (playerSlot > 100) ? "Dire" : "Radiant";
                    var winner = (["result"]["radiant_win"]) ? "Radiant" : "Dire";
                    var didWin = (team === winner) ? "won" : "lost";
                    var resp = ("You " + didWin + " a " + duration + " minute match as " + hero + " with a KDA of " + kills + ", " + deaths + ", " + assists + ".");
                    callback(null, resp);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
}

// return a string with the highest scores for various stats of the last match
function LastMatch(player_id, callback) {
    SteamGetPlayer(player_id, function(err, mID){
        if (!err){
            SteamGetMatch(mID, function(err, data) {
                if (!err){
                    var stats = {
                        "kills": [0, "hero"],
                        "assists": [0, "hero"],
                        "deaths": [0, "hero"],
                        "gpm": [0, "hero"],
                        "last hits": [0, "hero"],
                        "hero damage": [0, "hero"],
                        "tower damage": [0, "hero"],
                        "healing": [0, "hero"]
                    };
                    data["result"]["players"].forEach(function(elmt){
                        if (elmt["kills"] > stats["kills"][0]) {
                            stats["kills"] = [elmt["kills"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["assists"] > stats["assists"][0]) {
                            stats["assists"] = [elmt["assists"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["deaths"] > stats["deaths"][0]) {
                            stats["deaths"] = [elmt["deaths"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["gold_per_min"] > stats["gpm"][0]) {
                            stats["gpm"] = [elmt["gold_per_min"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["last_hits"] > stats["last hits"][0]) {
                            stats["last hits"] = [elmt["last_hits"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["hero_damage"] > stats["hero damage"][0]) {
                            stats["hero damage"] = [elmt["hero_damage"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["tower_damage"] > stats["tower damage"][0]) {
                            stats["tower damage"] = [elmt["tower_damage"], heroes[elmt["hero_id"].toString()]];
                        }
                        if (elmt["hero_healing"] > stats["healing"][0]) {
                            stats["healing"] = [elmt["hero_healing"], heroes[elmt["hero_id"].toString()]];
                        }
                    });
                    var resp = `${stats["kills"][1]} got the most kills (${stats["kills"][0]})\n` +
                    `${stats["assists"][1]} got the most assists (${stats["assists"][0]})\n` +
                    `${stats["deaths"][1]} died the most (${stats["deaths"][0]})\n` +
                    `${stats["gpm"][1]} had the highest gpm (${stats["gpm"][0]})\n` +
                    `${stats["last hits"][1]} got the most cs LUL (${stats["last hits"][0]})\n` +
                    `${stats["hero damage"][1]} did the most hero damage (${stats["hero damage"][0]})\n` +
                    `${stats["tower damage"][1]} did the most tower damage (${stats["tower damage"][0]})\n` +
                    `${stats["healing"][1]} did the most healing (${stats["healing"][0]})`;
                    callback(null, resp);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
}

// OpenDota takes a while to get the data, so I don't use this
// They parse the replay, which takes a while, although it yields great info
function ODotaGet(playerID, callback) {
    var urlOD = "https://api.opendota.com/api/players/" + playerID + "/matches";
    var options = {
        limit: 1
    };
    request.get({url:urlOD, qs:options}, function (err, response, body) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        if (response.statusCode == 200) {
            body = JSON.parse(body);
            callback(null, body);
        } else {
            console.log("STATUS: " + response.statusCode);
            callback(response.statusCode);
        }
    });
}

exports.ODotaGet = ODotaGet;
exports.SteamGetPlayer = SteamGetPlayer;
exports.SteamGetMatch = SteamGetMatch;
exports.MatchString = MatchString;
exports.LastMatch = LastMatch;
