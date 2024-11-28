import ChatSocket from "./chat-socket";
import socket from "./socket";

const chatController = new ChatSocket(socket);

export default chatController;