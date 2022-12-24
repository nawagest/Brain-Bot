require('dotenv').config();
const ask = require('./OpenAI/openai');
const axios = require('axios');
const express = require('express');
const { Client, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, MessageManager } = require('discord.js');
const { TOKEN: token } = process.env;

const app = express();

app.get('/', (req, res) => {
    res.send('Server for Brain Bot');
})

const prefix = '!'

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

client.on('ready', (c) => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setStatus('dnd');
    client.user.setActivity({ name: 'Thinking... 🧠' })
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!')) {
        const command = message.content.split('!')[1];
        if (command === 'hello') message.react('👋');
        if (command.startsWith('calc')) {
            const equation = (command.slice(5));
            if(!equation) {
                message.reply('Please give me an equation to solve 😢');
                return;
            }
            message.reply(`The answer to the equation ***${equation}*** is ${eval(equation)}`)
        }
        if (command.startsWith('chat')) {
            const gptPrompt = command.slice(5);
            if(!gptPrompt) {
                message.reply('Please say something 😢');
                return;
            };
            const response = await ask(gptPrompt);
            message.reply(response.choices[0].text);
        }
        if (command.startsWith('country')) {
            try {
                const name = command.slice(8);
                const data = await axios(`https://restcountries.com/v3.1/name/${name}`);
    
                const { name: { common: countryName }, region, latlng, flags: { png: flagPng }, population } = data.data[0];
    
                const embed = new EmbedBuilder()
                    .setColor('#DFBDC9')
                    .setTitle(countryName)
                    .setDescription(`Region: ${region}`)
                    .setThumbnail(flagPng)
                    .addFields(
                        { name: 'Latitude and Longitude:', value: `(${latlng})` },
                        { name: 'Population:', value: `${population}` }
                    )
                    .setFooter({ text: 'Data gathered from https://restcountries.com' })
                    .setTimestamp(new Date());
    
                message.channel.send({ embeds: [ embed ] })
            } catch {
                message.reply('Not a country silly 😅');
            }
        }
        if (command === 'bored') {
            const data = await axios('https://www.boredapi.com/api/activity/');
            const activity = (data.data.activity);
            message.reply(activity);
        }
        if (command === 'tod') {
            message.reply('Truth or Dare?');


            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('truth')
                        .setLabel('Truth')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('dare')
                        .setLabel('Dare')
                        .setStyle(ButtonStyle.Danger)
                );

            const filter = i => (i.customId === 'truth' || i.customId === 'dare') && i.user.id === message.author.id;

            const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });
            
            collector.on('collect', async i => {
                if (i.customId === 'truth') {
                    axios('https://tod-api.nawagest.repl.co/api/truth')
                        .then(async (data) => {
                            await i.update({ content: `${data.data}`, components: [] });
                        })
                        .catch(err => {
                            if(err) message.reply('Something went wrong 😢. Please try running the command again!');
                            console.log(err);
                        })
                }
                if (i.customId === 'dare') {
                    axios('https://tod-api.nawagest.repl.co/api/dare')
                        .then(async (data) => {
                            await i.update({ content: `${data.data}`, components: [] });
                        })
                        .catch(err => {
                            if (err) message.reply('Something went wrong 😢. Please try running the command again!');
                            console.log(err);
                        });
                }
            });
            
            collector.on('end', collected => {
                return;
            });

            message.reply({ content: 'Truth or Dare?', components: [ row ] });
        }
        if (command === 'wyr') {
            axios('https://tod-api.nawagest.repl.co/api/wyr')
                .then((data) => {
                    message.reply(data.data);
                })
                .catch(err => {
                    if (err) message.reply('Something went wrong 😢. Please try running the command again!');
                    console.log(err);
                });
        }
        if (command === 'commands' || command === 'cmds' || command === 'help') {
            const embed = new EmbedBuilder()
                .setColor('#DFBDC9')
                .setTitle('Commands')
                .setAuthor({ name: 'Brain Bot' })
                .setDescription('This is the list of all my commands!')
                .addFields(
                    { name: '`!`hello', value: 'I react with a simple waving emoji 👋' },
                    { name: '`!`calc (`expression to be solved`)', value: 'I can solve any javascript expression 😉' },
                    { name: '`!`country (`country name`)', value: 'Search any country around the world 🌎' },
                    { name: '`!`chat (`message`)', value: 'Talk to me whenever you feel like it. I have answers to everything 💪!' },
                    { name: '`!`bored', value: 'Feeling bored? You wont be bored after running this command 🙃!' },
                    { name: '`!`tod', value: 'I dare you to play some truth or dare with your friends 👀' },
                    { name: '`!`wyr', value: 'Play some fun would you rather with friends 💭!' }
                )
                .setFooter({ text: 'Follow (https://replit.com/@nawagest) on Replit 😁' })
                .setTimestamp(new Date());
            message.channel.send({ embeds: [ embed ] })
        }
    }
});

client.login(token);
app.listen(process.env.PORT || 3000);