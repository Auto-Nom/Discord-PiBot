# PiBot

**This is a Discord bot I run from my Raspberry Pi for my friends' Discord Channel**

Requires:
* node.js v6+
* discord.js node module
* request node module (for making api requests to steam for dota match info)

*You will need to add your own private info to the config file*

So far the main functions are getting and displaying info for the most recent dota match, and saying random quotes. I mainly just wrote it to learn javascript.
A lot of the quotes are from the Portal and Stanley Parable Dota 2 announcer packs.

*I am not quite sure what the best/most useful info is to display after a dota match, since a lot of it is available on the post game screen, but w/e.*

TODO:
* Add more quotes, and maybe have dota specific ones display based on the results of a dota related command.
* Improve the reply to the dota commands.
* Find out if there's a way to have it display the match info automatically after a match. (Other than have it frequently sending an api request to check for a new match)
* Make the bot randomly send a quote as a message, without being given a command.

:space_invader:
