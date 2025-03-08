import { createContext, useEffect, useState } from "react";
import { getDoc, doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { updateDoc } from 'firebase/firestore'

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState([]);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);


    const loadUserData = async (uid) => {
        try {
          const userRef = doc(db,'users',uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          setUserData(userData);
          if (userData.avatar && userData.name) {
            navigate('/chat')
          }
          else{
            navigate('/profile')
          }
          
          setInterval(async () => {
            if (auth.chatUser) {
              await updateDoc(userRef,{
                lastSeen: Date.now()
              })
            }
          }, 60000);

        } catch (error) {
         
        }
      }

      useEffect(() => {
        if (userData) {
          const chatRef = doc(db,'chats',userData.id)
          const unsub = onSnapshot(chatRef,async (res) => {
            const chatItems = res.data()?.chatsData || [];
            const tempData = [];
            for(const item of chatItems){
              const userRef = doc(db,'users',item.rId);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.data()
              tempData.push({...item,userData})
            }
            setChatData(tempData.sort((a,b)=>b.updatedAt - a.updatedAt))
          })
          return ()=>{
            unsub();
          }
          
        }
      },[userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messagesId, setMessagesId,
        messages, setMessages,
        chatUser, setChatUser,
        chatVisible, setChatVisible
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider