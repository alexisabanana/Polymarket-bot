# Welcome

This is just a wee project built to analyse polymarket high stakes bets for NBA, NFL & NHL

# How it works

The polymarket.js file is set up to pull data from poly market every couple of minutes (500 max requests, just down to polymarket's api limits) look for any high volume trades from new wallets (it locally stores each wallet, so resets after every use) using the criteria in the SPORTS_KEYWORD array (feel free to expand).
Then if there is any trade(s) it will then fire off a message to a discord channel i have set up with the details.

# How to set up

1. Copy repo
2. make sure you have Node 18+ installed
3. CD to the direcotry run 'npm install'
4. Go to discord and grab your discord URL, cite the discord developer documentation to find out how to do that
5. Paste into test.env, rename this file to '.env'
6. run 'Node Polymarket.js'
7. feel free to change the USD threshold, interval amount and even Sports_keyword values to make it your own.
