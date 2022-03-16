import { Client, Intents, WSEventType } from "discord.js";
import { config } from "dotenv";
import { Server, Socket } from "socket.io";

config();

const io = new Server();

io.listen(8299);

let sockets: Socket[] = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  sockets.push(socket);
  socket.on("disconnect", () => {
    sockets = sockets.filter((s) => s.id !== socket.id);
  });
});
const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILDS,
  ],
});

const passableEvents: WSEventType[] = [
  "MESSAGE_CREATE",
  "MESSAGE_REACTION_ADD",
  "GUILD_CREATE",
];

client.on("ready", () => {
  console.log("Ready!!!");
  const createListener = (eventName: string) => (data: any) => {
    sockets.forEach((s) => s.emit(eventName, data));
  };
  passableEvents.forEach((ev) => client.ws.on(ev, createListener(ev)));
});

client.login(process.env.DISCORD_BOT_TOKEN);
