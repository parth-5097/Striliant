import * as io from 'socket.io-client';
import {environment} from "../environments/environment";
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import {Message} from "./interfaces/message";

export class ChatService {
  private url = environment.socketConnectionUrl;
  private socket;

  constructor() {
    this.socket = io(this.url,{
      secure: true,
      rejectUnauthorized: false
    });
    this.socket.on('get_socket_id', (data) => {
    });
  }

  public connectUser(data)
  {
    this.socket.emit('connect_user', data);
  }

  public sendMessage(data) {
    this.socket.emit('new_chat_message', data);
  }

  public readMessage(data){
    this.socket.emit('message_received', data);
  }

  public seenMessage(data){
    this.socket.emit('message_seen', data);
  }


  public getMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('receive_message', (data) => {
        observer.next(data);
      });
    });
  }

  public getError = () => {
    return Observable.create((observer) => {
      this.socket.on('alert_message', (data) => {
        observer.next(data);
      });
    });
  }

  chatListListener(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('chat_list_listener', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  messageListener(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('message_listener', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
}
