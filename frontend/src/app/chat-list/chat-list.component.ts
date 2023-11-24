import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../services/http.service';
import { FormBuilder } from '@angular/forms';
import { ChatService } from '../chat.service';
import { Title } from '@angular/platform-browser';
import { Message } from '../interfaces/message';
import { CommonService } from '../services/common.service';
// @ts-ignore
import { NgxScrollEvent } from 'ngx-scroll-event';
import { environment } from '../../environments/environment';

declare var $: any;
@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit, AfterViewInit {
  public loginUser: any;
  public chatUser: any;
  message: string;
  public chatList: any[] = [];
  public file_list_new = [];
  public conversationMessageList: any[] = [];
  public unread_count: any;
  public page_no: any;
  public conversation_id: any;
  public is_load_more: any;
  send_file: any;
  public scrolled: any;
  public file: any;

  filesToUpload3: Array<File> = [];
  imageSrc_base64: string | ArrayBuffer = '';
  image_type = [
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/x-png',
    'image/png',
  ];
  video_type = ['video/mp4', 'video/ogg', 'video/webm'];
  audio_type = ['audio/ogg', 'audio/mpeg'];
  document_type = [
    'application/pdf',
    'application/doc',
    'application/docx',
    'application/rtf',
    'application/txt',
    'application/odf',
    'application/msword',
  ];

  search_keyword = '';
  searchList = '';

  constructor(
    private chatService: ChatService,
    public router: Router,
    public toastr: ToastrService,
    public http: HttpService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    if (localStorage.getItem('User')) {
      this.loginUser = JSON.parse(localStorage.getItem('User'));
    }
  }

  ngOnInit(): void {
    this.unread_count = 0;
    this.chatService.connectUser({ user_id: this.loginUser.userId });
    if (this.route.snapshot.params.id) {
      this.getChatList(this.route.snapshot.params.id);
    } else {
      this.getChatList();
    }
    this.chatListListener();
    this.messageListener();
  }

  ngAfterViewInit() {
    if ($(window).width() <= 991) {
      $(document).on('click', '.chat-container-wrapper-list', function () {
        $('.chatdiv').show();
        $('.mbl-section').hide();
        $('.mobile_super_admin').hide();
      });
      $(document).on('click', '.mbl_text_show', function () {
        $('.mobile_super_admin').show();
        $('.mb_chat_section').hide();
      });

      $(document).on('click', '.mobile_view_arrow', function () {
        $('.mbl-section').show();
        $('.mb_chat_section').hide();
        $('.mobile_super_admin').hide();
      });
    }
  }

  searchFunction(event) {
    if (event.target.value != '') {
      this.search_keyword = event.target.value;
      var data = { search_keyword: this.search_keyword };
      this.http
        .PostAPI('users/get_data_search', data)
        .then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchList = resdata.data;
          } else {
            this.searchList = '';
            this.toastr.error(resdata.message);
          }
        })
        .catch((err) => {
          this.toastr.error(err);
        });
    }
  }

  msgattachmenticonclick() {
    if ($('.add-menu-icon').hasClass('show-class')) {
      $('.add-menu-icon').removeClass('show-class');
    } else {
      $('.add-menu-icon').addClass('show-class');
    }
  }

  handleFileInput($event): void {
    // this.readThis($event.target);
    if ($event.target.files[0].size < 3000000 * 10) {
      this.file = {};
      var reader = new FileReader();
      this.file = $event.target.files[0];
      reader.readAsDataURL(this.file);
      $('.msg').val(this.file.name);
      reader.onload = (_event) => {
        this.imageSrc_base64 = reader.result;
      };
      var document = {
        fileName: this.file.name,
        size: this.file.size,
        data: this.file,
      };
      this.send_file = document;
    } else {
      this.toastr.error('maximum profile size 30 mb ');
    }
    $('#add-menu-icon').trigger('click');
  }

  removeFile() {
    this.send_file = [];
  }

  pushtoFileObject(file, base64) {
    this.file_list_new.push({
      name: file.name,
      base64: base64,
    });
  }

  getChatList(newuser = '') {
    this.commonService
      .PostAPI('users/chatList', {
        user_id: this.loginUser.userId,
        newuser: newuser,
      })
      .then((res) => this.onSuccess(res));
  }

  onSuccess(res) {
    console.log(res);
    if (res.status && res.chat_data.personal_chats.length > 0) {
      if (res.chat_data.personal_chats != undefined) {
        res.chat_data.personal_chats.forEach((item) => {
          this.chatList.push(item);
          this.unread_count = this.unread_count + item.unread_message;
        });
      }
    }
  }

  loadConversation(conversation_id, new_load) {
    if (this.searchList.length > 0) {
      for (var i = 0; i < this.searchList.length; i++) {
        let search_conversation_id =
          'personal_chat_' + this.searchList[i]['adminId'];
        if (this.chatList.length > 0) {
          let foundIndex1 = this.chatList.findIndex(
            (x) => x.conversation_id === search_conversation_id
          );
          if (foundIndex1 == -1) {
            if (search_conversation_id == conversation_id) {
              let item = {
                attachments: [],
                conversation_id:
                  'personal_chat_' + this.searchList[i]['adminId'],
                display_name: '',
                message_content: '',
                message_id: '',
                message_status: '',
                recipient_id: this.searchList[i]['adminId'],
                unread_message: 0,
                user_data: {
                  firstname: this.searchList[i]['firstname'],
                  lastname: this.searchList[i]['lastname'],
                  user_id_o: this.searchList[i]['adminId'],
                  is_online: this.searchList[i]['is_online'],
                  about: this.searchList[i]['about'],
                  mobileno: this.searchList[i]['mobileno'],
                  type: this.searchList[i]['type'],
                },
              };
              this.chatList.push(item);
              this.search_keyword = '';
              this.searchList = '';
            }
          }
        } else {
          if (search_conversation_id == conversation_id) {
            let item = {
              attachments: [],
              conversation_id: 'personal_chat_' + this.searchList[i]['adminId'],
              display_name: '',
              message_content: '',
              message_id: '',
              message_status: '',
              recipient_id: this.searchList[i]['adminId'],
              unread_message: 0,
              user_data: {
                firstname: this.searchList[i]['firstname'],
                lastname: this.searchList[i]['lastname'],
                user_id_o: this.searchList[i]['adminId'],
                is_online: this.searchList[i]['is_online'],
                about: this.searchList[i]['about'],
                mobileno: this.searchList[i]['mobileno'],
                type: this.searchList[i]['type'],
              },
            };
            this.chatList.push(item);
            this.search_keyword = '';
            this.searchList = '';
          }
        }
      }
    }
    this.conversation_id = conversation_id;
    if (new_load) {
      $('.chat-container-wrapper-list').removeClass('active_chat_div');
      $('#' + conversation_id).addClass('active_chat_div');
      this.is_load_more = 0;
      this.page_no = 1;
      this.conversationMessageList = [];
      const foundIndex = this.chatList.findIndex(
        (x) => x.conversation_id === conversation_id
      );
      this.chatUser = this.chatList[foundIndex].user_data;
    }
    this.commonService
      .PostAPI('users/loadConversation', {
        conversation_id: conversation_id,
        user_id: this.loginUser.userId,
        page_no: this.page_no,
        user_socket_id: 'OH7vfdD6MYjqMYloAAAA',
      })
      .then((resdata: any) => {
        if (resdata.status) {
          this.is_load_more = resdata.is_load_more;
          resdata.data.forEach((item) => {
            if (new_load) {
              this.conversationMessageList.push(item);
            }
          });

          if (!new_load && resdata.data.length > 0) {
            let temp_data = [];
            resdata.data.reverse();
            resdata.data.forEach((item) => {
              this.conversationMessageList.unshift(item);
            });
          }
          resdata.data.forEach((item) => {
            if (
              item.sender_user_id != this.loginUser.userId &&
              item.message_status != 3
            ) {
              item.receiver = this.loginUser.userId;
              this.chatService.seenMessage(item);

              const foundIndex2 = this.chatList.findIndex(
                (x) => x.conversation_id === conversation_id
              );
              if (this.chatList[foundIndex2].unread_message > 0) {
                this.chatList[foundIndex2].unread_message =
                  this.chatList[foundIndex2].unread_message - 1;
              }

              if (this.unread_count > 0) {
                this.unread_count = this.unread_count - 1;
              }
            }
          });

          if (new_load) {
            $('.chat-container-wrapper-list').removeClass('active_chat_div');
            $('#' + conversation_id).addClass('active_chat_div');
            $('.loadconversationdiv').animate({
              scrollTop: $('.loadconversationdiv')[0].scrollHeight,
            });
          } else {
            $('.loadconversationdiv').animate({
              scrollTop: 0,
            });
          }
        }
      });
    $('.chatdiv').show();
    $('.userinfodiv').show();
  }

  public handleScroll(event: NgxScrollEvent) {
    this.page_no = this.page_no + 1;
    this.loadConversation(this.conversation_id, 0);
  }

  keyFunc(event) {
    $('.input-text-box').removeClass('custom_error');
  }

  sendMessage(message_text) {
    if (message_text == '' && this.send_file == undefined) {
      $('.input-text-box').addClass('custom_error');
      return false;
    }
    $('.input-text-box').removeClass('custom_error');
    this.chatService.sendMessage({
      file: this.send_file,
      url: environment.socketConnectionUrl,
      filebase64: this.imageSrc_base64,
      message: message_text,
      from_user_id: this.loginUser.userId,
      to_user_id: this.conversation_id.replace('personal_chat_', ''),
    });
    this.send_file = [];
  }

  chatListListener(): void {
    this.chatService.chatListListener().subscribe((socketResponse: Message) => {
      // console.log('chat listener response');
      var chat_data = socketResponse.data;
      console.log(chat_data);
      if (socketResponse.event == 'update') {
        const foundIndex = this.chatList.findIndex(
          (x) => x.conversation_id === chat_data.conversation_id
        );

        if (chat_data.last_message_send_by != undefined) {
          this.chatList[foundIndex].last_message_send_by =
            chat_data.last_message_send_by;
        }

        if (chat_data.message_content != undefined) {
          this.chatList[foundIndex].message_content = chat_data.message_content;
        }

        if (chat_data.message_id != undefined) {
          this.chatList[foundIndex].message_id = chat_data.message_id;
        }

        if (chat_data.message_status != undefined) {
          this.chatList[foundIndex].message_status = chat_data.message_status;
        }

        if (chat_data.time != undefined) {
          this.chatList[foundIndex].time = chat_data.time;
        }

        if (chat_data.user_data != undefined) {
          if (chat_data.user_data.is_online != undefined) {
            this.chatList[foundIndex].user_data.is_online =
              chat_data.user_data.is_online;
          }
        }

        if (chat_data.unread_message != undefined) {
          if (chat_data.unread_message) {
            this.chatList[foundIndex].unread_message += 1;
            this.unread_count += 1;
          } else {
          }
        }
      }
    });
  }

  messageListener(): void {
    this.chatService.messageListener().subscribe((socketResponse) => {
      let message_data = socketResponse.data;
      // console.log(message_data);
      if (socketResponse.event == 'add') {
        console.log('stay here'); //log
        if (this.conversation_id == message_data.conversation_id) {
          this.conversationMessageList.push(message_data);
          $('#message_text').val('');
          this.scrolled += 250;
          $('.loadconversationdiv').animate({
            scrollTop: $('.loadconversationdiv')[0].scrollHeight,
          });
        }
        // console.log(this.conversation_id);
        // console.log('personal_chat_'+message_data.sender_user_id);
        if (
          this.conversation_id == message_data.conversation_id &&
          this.loginUser.userId != message_data.sender_user_id
        ) {
          message_data.receiver = this.loginUser.userId;
          this.chatService.seenMessage(message_data);
          if (this.chatList[0].unread_message > 0) {
            this.chatList[0].unread_message -= 1;
          }

          if (this.unread_count > 0) {
            this.unread_count -= 1;
          }
        } else if (this.loginUser.userId != message_data.sender_user_id) {
          message_data.receiver = this.loginUser.userId;
          this.chatService.readMessage(message_data);
        }
      } else if (socketResponse.event == 'update') {
        const foundIndex = this.conversationMessageList.findIndex(
          (x) => x.message_id === message_data.message_id
        );

        if (message_data.message_status != undefined) {
          this.conversationMessageList[foundIndex].message_status =
            message_data.message_status;
        }
      }
    });
  }

  paste_message(event) {
    var content = event.clipboardData.getData('text/html');
    document.getElementById('message_text').innerHTML = content;
  }

  onCopy() {
    this.toastr.info('Text copied to clipboard');
  }
}
