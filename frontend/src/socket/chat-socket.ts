import { ChatErrorResponse, ChatResponse } from "../type";
import { Socket } from "socket.io-client";

const CONNECT = 'connect';
const DISCONNECT = 'disconnect';

const CHAT_JOIN = 'chat:join';
const CHAT_JOIN_SUCCESS = 'chat:join|success';
const CHAT_JOIN_ERROR = 'chat:join|error';

const CHAT_LEAVE = 'chat:leave';
const CHAT_LEAVE_SUCCESS = 'chat:leave|success';
const CHAT_LEAVE_ERROR = 'chat:leave|error';

const MESSAGE_SEND = 'message:send';
const MESSAGE_SEND_SUCCESS = 'message:send|success';
const MESSAGE_SEND_ERROR = 'message:send|error';

const MESSAGE_RECEIVED = 'message:received';

export default class ChatSocket {
    private socket: Socket;
    private onConnect?: () => void;
    private onDisconnect?: () => void;

    private _str_onChatJoinSuccess?: (res: string) => void;
    private _str_onChatJoinError?: (res: string) => void;
    private _str_onChatSendSuccess?: (res: string) => void;
    private _str_onChatSendError?: (res: string) => void;
    private _str_onChatLeaveSuccess?: (res: string) => void;
    private _str_onChatLeaveError?: (res: string) => void;
    private _str_onMessageReceived?: (res: string) => void;

    private preiousUserId: number = -1;

    public joinChat(targetUserId: number) {
        if(this.preiousUserId !== -1 && this.preiousUserId !== targetUserId) {
            this.leaveChat(this.preiousUserId);
            // console.log('leaving chat ' + this.preiousUserId);
        }
        this.socket.emit(CHAT_JOIN, targetUserId);
        // console.log('joining chat ' + targetUserId);
        this.preiousUserId = targetUserId;
    }

    public sendMessage(targetUserId: number, message: string) {
        this.socket.emit(MESSAGE_SEND, targetUserId, message);
    }

    public leaveChat(targetUserId: number) {
		this.socket.emit(CHAT_LEAVE, targetUserId);
    }

    private fromJson<T>(res: string) {
        return JSON.parse(res) as T;
    }

    constructor(socket: Socket) {
        this.socket = socket;
    }

    public reinitialize({
        onConnect,
        onDisconnect,
        onChatJoinSuccess,
        onChatJoinError,
        onChatSendSuccess,
        onChatSendError,
        onChatLeaveSuccess,
        onChatLeaveError,
        onMessageReceived
    }:{
        onConnect: () => void,
        onDisconnect: () => void,
        onChatJoinSuccess: (res: ChatResponse) => void,
        onChatJoinError: (res: ChatErrorResponse) => void,
        onChatSendSuccess: (res: ChatResponse) => void,
        onChatSendError: (res: ChatErrorResponse) => void,
        onChatLeaveSuccess: (res: ChatResponse) => void,
        onChatLeaveError: (res: ChatErrorResponse) => void,
        onMessageReceived: (res: ChatResponse) => void
    }) {
        this.unsubscribe();
        this.onConnect = onConnect;
        this.onDisconnect = onDisconnect;
        this._str_onChatJoinSuccess = r => onChatJoinSuccess(this.fromJson(r));
        this._str_onChatJoinError = r => onChatJoinError(this.fromJson(r));
        this._str_onChatSendSuccess = r => onChatSendSuccess(this.fromJson(r));     
        this._str_onChatSendError = r => onChatSendError(this.fromJson(r));
        this._str_onChatLeaveSuccess = r => onChatLeaveSuccess(this.fromJson(r));
        this._str_onChatLeaveError = r => onChatLeaveError(this.fromJson(r));
        this._str_onMessageReceived = r => onMessageReceived(this.fromJson(r));
        this.subscribe();
    }

    private subscribe() {
        if(!this.onConnect || !this.onDisconnect || !this._str_onChatJoinSuccess || !this._str_onChatJoinError || !this._str_onChatSendSuccess || !this._str_onChatSendError || !this._str_onChatLeaveSuccess || !this._str_onChatLeaveError || !this._str_onMessageReceived) {
            throw new Error('ChatSocket: not all handlers are set');
        }
        this.socket.on(CONNECT, this.onConnect);
        this.socket.on(DISCONNECT, this.onDisconnect);
        this.socket.on(CHAT_JOIN_SUCCESS, this._str_onChatJoinSuccess);
        this.socket.on(CHAT_JOIN_ERROR, this._str_onChatJoinError);
        this.socket.on(MESSAGE_SEND_SUCCESS, this._str_onChatSendSuccess);
        this.socket.on(MESSAGE_SEND_ERROR, this._str_onChatSendError);
        this.socket.on(CHAT_LEAVE_SUCCESS, this._str_onChatLeaveSuccess);
        this.socket.on(CHAT_LEAVE_ERROR, this._str_onChatLeaveError);
        this.socket.on(MESSAGE_RECEIVED, this._str_onMessageReceived);
        
        // for debugging
        // socket.onAny((event, ...args) => {
        // 	console.log(event, args);
        // });
    }

    public unsubscribe() {
        this.socket.off(CONNECT, this.onConnect);
        this.socket.off(DISCONNECT, this.onDisconnect);
        this.socket.off(CHAT_JOIN_SUCCESS, this._str_onChatJoinSuccess);
        this.socket.off(CHAT_JOIN_ERROR, this._str_onChatJoinError);
        this.socket.off(MESSAGE_SEND_SUCCESS, this._str_onChatSendSuccess);
        this.socket.off(MESSAGE_SEND_ERROR, this._str_onChatSendError);
        this.socket.off(CHAT_LEAVE_SUCCESS, this._str_onChatLeaveSuccess);
        this.socket.off(CHAT_LEAVE_ERROR, this._str_onChatLeaveError);
        this.socket.off(MESSAGE_RECEIVED, this._str_onMessageReceived);
        this.leaveChat(this.preiousUserId);
    }

    connect() {
        if(!this.socket.connected)
            this.socket.connect();
    }
}
