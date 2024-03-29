require("dotenv").config();
const ask = require("./OpenAI/openai");
const axios = require("axios");
const express = require("express");
const {
  Client,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Embed,
  MessageManager,
} = require("discord.js");
const { TOKEN: token } = process.env;

const app = express();

app.use(express.static("static"));

app.get("/", (req, res) => {
  res.send("./static/index.html");
});

const prefix = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on("ready", (c) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  client.user.setStatus("dnd");
  client.user.setActivity({ name: "Thinking... 🧠" });
});

client.on("debug", (a) => {
  if (a.startsWith(`Hit a 429`)) {
    process.kill(1);
  }
});

client.on("rateLimit", (data) => {
  process.kill(1);
});

client.on("rateLimited", () => {
  process.kill(1);
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith(prefix)) {
    const command = message.content.split(prefix)[1];
    if (command === "hello") message.react("👋");
    if (command.startsWith("chat")) {
      // const gptPrompt = command.slice(5);
      // if(!gptPrompt) {
      //     message.reply('Please say something 😢');
      //     return;
      // };
      // const response = await ask(gptPrompt);
      // // create a timeout function so that if it takes to long it can cancel the request
      // message.reply(response.choices[0].text);
      message.reply(
        "Sorry, this is no longer a feature. Please try another command.",
      );
    }
    if (command.startsWith("country")) {
      try {
        const name = command.slice(8);
        const data = await axios(`https://restcountries.com/v3.1/name/${name}`);

        const {
          name: { common: countryName },
          region,
          latlng,
          flags: { png: flagPng },
          population,
          capital,
        } = data.data[0];

        const embed = new EmbedBuilder()
          .setColor("#DFBDC9")
          .setTitle(countryName)
          .setDescription(`Region: ${region}`)
          .setThumbnail(flagPng)
          .addFields(
            { name: "Capital:", value: `${capital}` },
            { name: "Latitude and Longitude:", value: `(${latlng})` },
            { name: "Population:", value: `${population}` },
          )
          .setFooter({ text: "Data gathered from https://restcountries.com" })
          .setTimestamp(new Date());

        message.channel.send({ embeds: [embed] });
      } catch {
        message.reply("Not a country silly 😅");
      }
    }
    if (command === "bored") {
      const data = await axios("https://www.boredapi.com/api/activity/");
      const activity = data.data.activity;
      message.reply(activity);
    }
    if (command === "tod") {
    //   message.reply("Truth or Dare?");

    //   const row = new ActionRowBuilder().addComponents(
    //     new ButtonBuilder()
    //       .setCustomId("truth")
    //       .setLabel("Truth")
    //       .setStyle(ButtonStyle.Primary),
    //     new ButtonBuilder()
    //       .setCustomId("dare")
    //       .setLabel("Dare")
    //       .setStyle(ButtonStyle.Danger),
    //   );

    //   const filter = (i) =>
    //     (i.customId === "truth" || i.customId === "dare") &&
    //     i.user.id === message.author.id;

    //   const collector = message.channel.createMessageComponentCollector({
    //     filter,
    //     time: 15000,
    //   });

    //   collector.on("collect", async (i) => {
    //     if (i.customId === "truth") {
    //       axios("https://cghqj5-3000.csb.app/api/truth")
    //         .then(async (data) => {
    //           await i.update({ content: `${data.data}`, components: [] });
    //         })
    //         .catch((err) => {
    //           if (err)
    //             message.reply(
    //               "Something went wrong 😢. Please try running the command again!",
    //             );
    //           console.log(err);
    //         });
    //     }
    //     if (i.customId === "dare") {
    //       axios("https://cghqj5-3000.csb.app/api/dare")
    //         .then(async (data) => {
    //           await i.update({ content: `${data.data}`, components: [] });
    //         })
    //         .catch((err) => {
    //           if (err)
    //             message.reply(
    //               "Something went wrong 😢. Please try running the command again!",
    //             );
    //           console.log(err);
    //         });
    //     }
    //   });

    //   collector.on("end", (collected) => {
    //     return;
    //   });

    //   message.reply({ content: "Truth or Dare?", components: [row] });
        message.reply("Sorry this command no longer works :(")
    }
    if (command === "wyr") {
    //   axios("https://cghqj5-3000.csb.app/api/wyr")
    //     .then((data) => {
    //       message.reply(data.data);
    //     })
    //     .catch((err) => {
    //       if (err)
    //         message.reply(
    //           "Something went wrong 😢. Please try running the command again!",
    //         );
    //       console.log(err);
    //     });
        message.reply('Sorry this command no longer works :(')
    }
    if (command === "commands" || command === "cmds" || command === "help") {
      const embed = new EmbedBuilder()
        .setColor("#DFBDC9")
        .setTitle("Commands")
        .setAuthor({ name: "Brain Bot" })
        .setDescription("This is the list of all my commands!")
        .addFields(
          { name: "`!`hello", value: "I react with a simple waving emoji 👋" },
          {
            name: "`!`country (`country name`)",
            value: "Search any country around the world 🌎",
          },
          {
            name: "`!`chat (`message`)",
            value:
              "Talk to me whenever you feel like it. I have answers to everything 💪! (command no longer works, I ran out of tokens 😢)",
          },
          {
            name: "`!`bored",
            value:
              "Feeling bored? You wont be bored after running this command 🙃!",
          },
          {
            name: "`!`tod",
            value: "I dare you to play some truth or dare with your friends 👀 (command no longer works unfortunately 😢)",
          },
          {
            name: "`!`wyr",
            value: "Play some fun would you rather with friends 💭! (command no longer works unfortunately 😢)",
          },
        )
        .setFooter({
          text: "Follow (https://replit.com/@nawagest) on Replit 😁",
        })
        .setTimestamp(new Date());
      message.channel.send({ embeds: [embed] });
    }
  }
});

client.login(token);
app.listen(process.env.PORT || 3001);
