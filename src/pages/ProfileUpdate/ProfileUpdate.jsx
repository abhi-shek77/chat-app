import React, { useContext } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'
import { AppContext } from '../../context/AppContext'

const ProfileUpdate = () => {

  const navigate = useNavigate();

  const [image, setImage] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [prevImage, setPrevImage] = useState('');
  const [uid, setUid] = useState('');
  const {setUserData} = useContext(AppContext)

    const profileUpdate = async (event) => {
      event.preventDefault();
      
      try {
          if (!prevImage && !image) {
              toast.error('Upload a profile picture');
              return;
          }
  
          const docRef = doc(db, 'users', uid);
  
          let imgUrl = prevImage; // Default to previous image
          if (image) {
              imgUrl = await upload(image);
              if (!imgUrl) {
                  toast.error('Image upload failed');
                  return;
              }
              setPrevImage(imgUrl);
          }
  
          await updateDoc(docRef, {
              avatar: imgUrl,
              bio: bio,
              name: name
          });

          toast.success('Profile updated successfully!');
          const snap = await getDoc(docRef)
          setUserData(snap.data())
          navigate('/chat')

      } catch (error) {
          console.error(error);
          toast.error('Something went wrong');
      }
  };


    useEffect( () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
         setUid(user.uid)
         const docRef = doc(db,'users',user.uid)
         const docSnap = await getDoc(docRef)
         const data = docSnap.data();
         if (data.name) setName(data.name);
         if (data.bio) setBio(data.bio);
         if (data.avatar) setPrevImage(data.avatar)
        }
        else{
          navigate('/')
        }
      })
    },[])

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
            <h3>Profile Details</h3>
            <label htmlFor="avatar">
                <input onChange={(e)=>setImage(e.target.files[0])} type="file" accept='.png, .jpeg, .jpg' id="avatar" hidden />
                <img src={image? URL.createObjectURL(image): assets.avatar_icon} />
                upload profile image
            </label>
            <input onChange={(e)=>setName(e.target.value)} value={name} type="text" placeholder='Your name' required />
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio' required></textarea>
            <button type='submit'>Save</button>
        </form>
        <img className='profile-pic' src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate
