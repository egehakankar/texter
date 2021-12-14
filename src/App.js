import './App.css';
import './darkCss/dark.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useRef, useEffect } from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

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
    <div className="App darkGray">
      {show ? <ToastContainer /> : ""}
      <header className="">

      </header>
      <Container className="cont" maxWidth="xl">
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
    <Button className="signOut" onClick={() => auth.signOut()} variant="outlined" color="error">Sign Out</Button>
  )
}

function Chats() {
  const dummy = useRef();

  const messagesRef = firestore.collection('allmesage');
  const query = messagesRef.orderBy('timeK').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      message: formValue,
      timeK: firebase.firestore.FieldValue.serverTimestamp(),
      idK: uid,
      photo: photoURL,
      name: displayName
    });

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="dark:bg-black">
      {<SignOut />}
      <List className="darkGray messages" sx={{ width: '100%', maxWidth: 360, }}>
        {messages && messages.map(msg => <Message message={msg} />)}

        <div ref={dummy}></div>
      </List>

      <form className="form" onSubmit={sendMessage}>
        <TextField
          className="inp"
          id="outlined-multiline-flexible"
          label="Message"
          multiline
          maxRows={2}
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />

        <Button className="send" type="submit" variant="outlined" color="success">
          Send
        </Button>
      </form>
    </div>
  )
}


function Message(props) {
  const { message, idK, photo, timeK } = props.message;
  var date = new Date(Number(timeK) * 25.693348);
  const timeS = ((date.getDate() - 1) + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()).toString();
  const mC = idK === auth.currentUser.uid ? 'sent' : 'recieved';

  return (
    <div className={`message ${mC}`}>
      <ListItem className={`message ${mC}`}>
        <ListItemAvatar>
          <Avatar>
            <img src={photo} alt = "dsf"/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={timeS} secondary={message} />

      </ListItem>
      <Divider className={`divider ${mC}D`} variant="inset" component="li" />
    </div>
  )
}

export default App;
