import axios from 'axios';

export async function sendDiscord(message){
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: message
    });
}