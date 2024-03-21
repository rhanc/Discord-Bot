require('dotenv').config();
const { token } = require('./config.json');
const {Client, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ],
});

const roles = [
    {
        id: '1220124337307258910',
        label:'Mods'
    },
    {
        id: '1220124600361422928',
        label:'members'
    }
]

client.on('ready', async(c)=>{
    try {
		console.log("Creating buttons");
        const channel = await client.channels.cache.get('1217587066355843102');
        if(!channel) return;
        const row = new ActionRowBuilder();
        roles.forEach((role)=>{
            row.components.push(
				new ButtonBuilder()
				.setCustomId(role.id)
				.setLabel(role.label)
				.setStyle(ButtonStyle.Primary))
        });
      await  channel.send({
            content:"Claim or remove a role below.",
            components:[row]
        });
		process.exit()
    }
    catch(error)
    {
        console.log(error);
    }
})

client.login(token);