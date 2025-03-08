import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'

const ChatBox = () => {

    const {chatUser, userData, messages, setMessages, messagesId, chatVisible, setChatVisible} = useContext(AppContext);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        try {
            
            if (input && messagesId) {
                await updateDoc(doc(db,'messages',messagesId),{
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                });
                const userIDs = [chatUser.rId,userData.id]

                userIDs.forEach(async (id)=>{
                    const userChatsRef = doc(db,'chats',id);
                    const userChatsSnapShot = await getDoc(userChatsRef);

                    if (userChatsSnapShot.exists()) {
                        const userchatData = userChatsSnapShot.data()
                        const chatIndex = userchatData.chatsData.findIndex((c)=>c.messageId === messagesId);
                        userchatData.chatsData[chatIndex].lastMessage = input.slice(0,30);
                        userchatData.chatsData[chatIndex].updatedAt = Date.now();
                        if (userchatData.chatsData[chatIndex].rId === userData.id) {
                            userchatData.chatsData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatsRef,{
                            chatsData: userchatData.chatsData
                        })
                        
                    }
                })
            }

        } catch (error) {
            toast.error(error.message)
        }
        setInput('')
    }

    const convertTimeStamp = (timestamp)=>{
        let date = timestamp.toDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        if (hour>12) {
            return hour-12 + ':' + minute + ' PM'
        }
        else{
            return hour + ':' + minute + ' AM'
        }
    }

    useEffect(() => {
        if (messagesId) {
            const unsub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
                if (res.exists()) {
                    const data = res.data();
                    if (data.messages && Array.isArray(data.messages)) {
                        setMessages([...data.messages].reverse());
                        
                    } else {
                        console.warn("Messages field is missing or not an array.");
                        setMessages([]);
                    }
                } else {
                    console.warn("No messages found for this ID:", messagesId);
                    setMessages([]);
                }
            });
    
            return () => unsub();
        }
    }, [messagesId]);
    
    

  return chatUser ? (
    <div className={`chat-box ${chatVisible?"":"hidden"}`}>
        <div className="chat-user">
            <img src={chatUser.userData.avatar} alt="" />
            <p>{chatUser.userData.name} <img src={assets.green_dot} className='dot' /></p>
            <img src={assets.help_icon} className='help' />
            <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
        </div>


        <div className="chat-msg">

            {messages.map((msg,index)=>(
                <div key={index} className={msg.sId === userData.id? "s-msg": "r-msg"}>
                <p className='msg'>{msg.text}</p>
                <div>
                    <img src={msg.sId === userData.id? userData.avatar : chatUser.userData.avatar} alt="" />
                    <p>{convertTimeStamp(msg.createdAt)}</p>
                </div>
            </div>
            ))}
        </div>


        <div className="chat-input">
            <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='send a message' />
            <input type="file" id='image' accept='image/png, image/jpeg' hidden  />
            <label htmlFor="image">
                <img src={assets.gallery_icon} alt="" />
            </label>
            <img onClick={sendMessage} src={assets.send_button} alt="" />
        </div>
    </div>
  ):
  <div className={`chat-welcome ${chatVisible?"":"hidden"}`}>
    <img src={assets.logo} alt="" />
    <p>Chat anytime, anywhere</p>
  </div>
}

export default ChatBox
