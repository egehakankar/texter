import './App.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useRef, useEffect } from 'react';

import firebase from 'firebase/compat/app';
import * as mes from "firebase/messaging";

import "firebase/messaging";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';


firebase.initializeApp({
  apiKey: "AIzaSyA7u2BiZJH_NYkipybK6JQi076ltPLOSEQ",
  authDomain: "texter-1f7e3.firebaseapp.com",
  projectId: "texter-1f7e3",
  storageBucket: "texter-1f7e3.appspot.com",
  messagingSenderId: "583050695852",
  appId: "1:583050695852:web:8321b99894f47fc13c3b09"
})
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: "", body: "" });
  const [counter, setCounter] = useState(0);
  const messaging = mes.getMessaging();

  mes.onMessage(messaging, (payload) => {
    setShow(true);
    setNotification({
      title: payload.notification.title,
      body: payload.notification.body,
    });
    setCounter(counter + 1);

  });

  if (counter > 0) {
    toast(<Display />, {
      toastId: counter,
    });
  }

  function Display() {
    return (
      <div>

        <div>
          <h4>{notification.title}</h4>
          <p>{notification.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {show ? <ToastContainer /> : ""}
      <header className="">

      </header>
      <Container maxWidth="xl">
        {user ? <Chats /> : <SignIn />}
      </Container>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <Button onClick={signInWithGoogle} variant="outlined">Sign In</Button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <Button onClick={() => auth.signOut()} variant="outlined" color="error">Sign Out</Button>
  )
}

function Chats() {
  const dummy = useRef();

  const messagesRef = firestore.collection('allmesage');
  const query = messagesRef.orderBy('time').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      message: formValue,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      id: uid,
      photo: photoURL
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      {<SignOut />}
      <div>
        {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <Button type="submit" variant="contained" color="success">
          Send
        </Button>
      </form>
    </>
  )
}


function Message(props) {
  const { message, id, photo } = props.message;
  const mC = id === auth.currentUser.uid ? 'sent' : 'recieved';

  return (
    <Container maxWidth="md" className={`message ${mC}`}>
      <img src={photo} />
      <p>{message}</p>
    </Container>
  )
}

export default App;
