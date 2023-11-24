export interface Message {
  message_id: string;
  sender_user_id: string;
  message_content: string;
  time: string;
  attachments:any;
  conversation_id: string;
  message_status:Number;
  entry_date_time:String;
  event:any;
  data:any;


  // fromUserId: string;
  // message: string;
  // document: any;
  // toUserId: string;
  // username: String;
  // group_id:String;
  // likeInsert: boolean;
  // like_num : Number;
  // reply_msg:String;
  // reply_token : String;
  // random: string;
  // path : any;
  // type : string;
  // document_type : string;
  // document_name : string;
  // document_size : number;
  // datetime: String;
}


