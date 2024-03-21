const fs = require('node:fs');//Includes module
const XIVAPI = require('@xivapi/js')//Include xivapi
const path = require('node:path'); //Include module
const { Client, Collection, Events, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');//Include discord.js module
const { token } = require('./config.json');//include config file
const xiv = new XIVAPI()//Instantiate object

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
	IntentsBitField.Flags.GuildMembers,
	IntentsBitField.Flags.GuildMessages,
	IntentsBitField.Flags.MessageContent], }); //Create instance of Client object
client.commands = new Collection();//Create instance of Collection object
const foldersPath = path.join(__dirname, 'commands');//Include folder for commands
const commandFolders = fs.readdirSync(foldersPath);



for (const folder of commandFolders) {//For each loop to read data
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {//Sends a message to the console on start up
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('interactionCreate',async (interaction)=>{//Detects if the user presses a button
	try {
		if(!interaction.isButton())return;
	await interaction.deferReply({ephemeral:true});
	const role = interaction.guild.roles.cache.get(interaction.customId);
	if(!role)
	{
		interaction.editReply({
			content:"Role not found", 
		})
		return;
	}
	const hasRole = interaction.member.roles.cache.has(role.id);
	if(hasRole)
	{
		await interaction.member.roles.remove(role);
		await interaction.editReply('Role '+role.name+' has been deleted');
		return;
	}

	await interaction.member.roles.add(role);
	await interaction.editReply('Role '+role.name+' has been added');

	} catch(error) {
		console.log(error);
	}
})

  let name = "";
client.on('messageCreate',async (message)=>{//Detects if the user creates and sends a message
	let content = message.content; //Take content property from message
	if(message.author.bot)//If message is from bot, ignore
	{
		return;
	}
	else if(content.toLowerCase() == "help")
	{
		/*
		Convert the message to lower case and see if it says help
		*/
		let cmds = "Here are commands I can execute:\n1: Return today's date.";
		cmds+= "\n2: Search for item";
		cmds+= "\n3: Search for Achievements";
		message.reply(cmds);
	}
	else if(content == "1")
	{
		message.reply(new Date().toDateString());//Show the user the date
	}
	else if(content[0] == "2" && content.length > 1)//Search for an item in the database
	{ 
		let SearchType = "item";
		Search(name,SearchType, content,message)
	}
	else if((content[0] -'0') == 2 && content.length <=2)
	{//Check for an incomplete search
		message.reply("You're searching for an item, but I don't know what to search for.");
	}
	else if(content.toLowerCase('help') && ((content[0] -'0')>=0 && (content[0] -'0') <=10) == false)
	{//Check for an empty search
		message.reply("Please either type \"help\" to get a list of commands or a number following a word");
	}
	else if(content[0] == "3" && content.length > 1)
	{ //Show the user any achievements that match the search
		let SearchType = "achievement";
		Search(name,SearchType, content,message)
	  
	}
	}); 
	  async function Search(name,SearchType, content,message)
	  {
		/*
		Search function that is used for option 2 and 3
		*/
		name = content.substring(2,content.length); 
		name = name.trim();
		console.log("Name: "+name+" Length: "+name.length);
		console.log("-"+name+"-");
		let response = await xiv.search(name, {snake_case: true})
		let data = response["results"];
		let results = "";
		//For loop to show all results that match
		for(let i = 0; i < response["results"].length; i++)
		{
			let DataType = data[i].url_type.toLowerCase()
			let DataName = data[i].name.toLowerCase()
			if(DataType == "action")
			{
				continue;
			}
			console.log('type: '+DataType)
			
			console.log('type: '+SearchType)
			if(DataType == SearchType)
			{
				console.log('searching for: '+DataName)
			console.log('type: '+DataType)
			console.log('Data: '+name)
			}
			if(results.length < 1000&&DataName.includes(name.toLowerCase()) && SearchType.toLowerCase() == DataType)
			{
				results+="\nID: "+data[i].id+"\nName: "+data[i].name+"\nURL_Type: "+data[i].url_type
				console.log((response["results"][i]));
				console.log(response["results"][i].name);  
			}
		}
		if(results == "")//If results variable is empty, return error message
		{
			message.reply("Can't find any "+SearchType+"s that contain the name "+name);
		}
		else//Show message to user
		{
			message.reply(results);
		} 
	  }  
client.on(Events.InteractionCreate, async interaction => {
	let command ;
	if (interaction.isChatInputCommand()==false) 
	{
		return;
	}
	else
	{
		command = interaction.client.commands.get(interaction.commandName);
	}
	

	if (!command) {
		console.log(interaction.commandName+" was not found"); 
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
 





client.login(token);

