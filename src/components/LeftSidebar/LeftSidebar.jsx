import React, { useContext, useEffect, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {

  const navigate = useNavigate();
  const {userData, chatData, messagesId, setMessagesId, chatUser, setChatUser, chatVisible, setChatVisible} = useContext(AppContext)
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false)

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '==', input.toLowerCase()));
        const querySnap = await getDocs(q);
  
        if (!querySnap.empty) {
          const foundUser = querySnap.docs[0].data();
  
          if (foundUser.id !== userData.id) {
            let userExist = chatData.some(user => user.rId === foundUser.id);
            if (!userExist) {
              setUser(foundUser);
            } else {
              setUser(null);
            }
          } else {
            console.warn("⚠️ User is the same as logged-in user.");
            setUser(null);
          }
        } else {
          console.warn("⚠️ No user found with this username.");
          setUser(null);
        }
      } else {
        setShowSearch(false);
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Error searching for user:", error);
    }
  };
  

  const addChat = async () => {

    if (!user) {
      console.error("User is null. Cannot add chat.");
      toast.error("No user selected to start a chat.");
      return;
    }
    const msgsRef = collection(db,'messages');
    const chatRef = collection(db,'chats');
    try {
      const newMsgRef = doc(msgsRef);

      await setDoc(newMsgRef,{
        createAt: serverTimestamp(),
        messages: []
      })

      await updateDoc(doc(chatRef,user.id),{
        chatsData:arrayUnion({
          messageId: newMsgRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt:Date.now(),
          messageSeen:true
        })
      })

      await updateDoc(doc(chatRef,userData.id),{
        chatsData:arrayUnion({
          messageId: newMsgRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt:Date.now(),
          messageSeen:true
        })
      })
      
      const uSnap = await getDoc(doc(db,'users',user.id))
      const uData = uSnap.data();
      setChat({
        messagesId: newMsgRef.id,
        lastMessage: '',
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData
      })
      setShowSearch(false)
      setChatVisible(true)

    } catch (error) {
      toast.error(error.message);
      console.error(error)
    }
  }

  const handleAddchat = () => {
    setTimeout(() => {
      addChat()
    }, 100);
  }

  const setChat = async (item) => {
    setMessagesId(item.messageId)
    setChatUser(item)
    const userChatsRef = doc(db,'chats',userData.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData = userChatsSnapshot.data();
    const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId===item.messageId);
    userChatsData.chatsData[chatIndex].messageSeen = true;
    await updateDoc(userChatsRef,{
      chatsData: userChatsData.chatsData
    });
    setChatVisible(true)
  }

  useEffect(() => {

    const updateChatUserData = async () => {

      const userRef = doc(db,'users',chatUser.userData.id);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data()
      setChatUser(prev=>({...prev,userData:userData}))

    }
    updateChatUserData()

  },[chatData])

  return (
    <div>
      <div className={`ls ${chatVisible ? 'hidden':''}`}>
        <div className="ls-top">
            <div className="ls-nav">
                <img src={assets.logo} className="logo" />
                <div className="menu">
                    <img src={assets.menu_icon} />
                    <div className="sub-menu">
                      <p onClick={()=>navigate('/profile')}>Edit Profile</p>
                      <hr />
                      <p>Logout</p>
                    </div>
                </div>
            </div>
            <div className="ls-search">
                <img src={assets.search_icon} />
                <input onChange={inputHandler} type="text" placeholder='Search here...' />
            </div>
        </div>
        <div onClick={handleAddchat} className="ls-list">
          {showSearch && user 
          ? <div className='friends add-user'>
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
            </div>
          : 
            chatData.map((item, index)=>(
            <div onClick={()=>setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId? '' : 'border'}`}>
            <img src={item.userData.avatar} />
            <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
            </div>
            </div>
           )
                 
           )}
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar
