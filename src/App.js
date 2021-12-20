import './App.css';
import './darkCss/dark.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useRef, useEffect } from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';

import firebase from 'firebase/compat/app';
import * as mes from "firebase/messaging";

import "firebase/messaging";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

import axios from 'axios';


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

toast.configure();


function App() {
  const [user] = useAuthState(auth);
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: "", body: "" });
  const [counter2, setCounter] = useState(0);
  const messaging = mes.getMessaging();

  mes.onMessage(messaging, (payload) => {

    if (payload.notification !== undefined) {
      setShow(true);
      setNotification({
        title: payload.notification.title,
        body: payload.notification.body,
      })
      setCounter(counter2 + 1);
    }
  });

  useEffect(() => {
    if (counter2 > 0) {
      toast(<Display />, {
        toastId: counter2,
        autoClose: 5000
      });
    }
  }, [counter2]);


  function Display() {
    return (
      <div>
        {show ? <div>
          <div>
            <h4>{notification.title}</h4>
            <p>{notification.body}</p>
          </div>
        </div> : ""}
      </div>
    );
  }

  return (
    <div className="App darkGray">
      <header className="">
      </header>
      <Container className="cont" maxWidth="xl">
        {user ? <Chats /> : <SignIn />}
      </Container>
    </div>

  );
}

function SignIn() {


  const signInWithGoogle = async (e) => {
    e.preventDefault();

    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);

    const { uid } = auth.currentUser;

    const messaging = mes.getMessaging();
    mes.getToken(messaging, { vapidKey: 'BF36G3JsgP78J61qmmLskcGMaRx_P2i6-7Oe0pkW3zX67H-2vH4S7uk7HEVAW35dtA63uEW05R9vHOaEV9cz7AY' }).then((currentToken) => {
      if (currentToken) {

        const body1 = { token: currentToken, uid: uid };
        axios.post('https://us-central1-texter-1f7e3.cloudfunctions.net/addKey', body1, {
          headers: {
            "Access-Control-Allow-Headers": "*", // this will allow all CORS requests
            "Access-Control-Allow-Methods": "*", // this states the allowed methods
            "Content-Type": "application/json"
          }
        }).then(response => console.log("Response: " + response.data)).catch(error => {
          console.error('There was an error!', error);
        });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
  }
  return (
    <div className="signInAll">
      <button className="login-with-google-btn" onClick={signInWithGoogle} >Sign In With Google</button>
    </div>

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
  const photoRef = firestore.collection('keys');

  const query = messagesRef.orderBy('timeK');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const [checked, setChecked] = useState(true);

  useEffect(async () => {
    const { uid } = auth.currentUser;

    await photoRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().uid === uid) {
          if (doc.data().photos === true) {
            setChecked(true)
          }
          else {
            setChecked(false)
          }
        }
      })
    })
  }, [])

  const handleChange = async (event) => {
    event.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    setChecked(event.target.checked);

    await photoRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().uid === uid) {
          if (doc.data().photos === true) {
            doc.ref.update({
              photos: false
            })
          }
          else {
            doc.ref.update({
              photos: true
            })
          }

        }
      })
    })

    if (checked) {
      await messagesRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().idK === uid) {
            doc.ref.update({
              photo: ""
            })
          }
        })
      })
    }
    else {
      await messagesRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().idK === uid) {
            doc.ref.update({
              photo: photoURL
            })
          }
        })
      })
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;

    if (checked === false) {
      await messagesRef.add({
        message: formValue,
        timeK: firebase.firestore.FieldValue.serverTimestamp(),
        idK: uid,
        photo: "",
        name: displayName
      });
    }
    else {
      await messagesRef.add({
        message: formValue,
        timeK: firebase.firestore.FieldValue.serverTimestamp(),
        idK: uid,
        photo: photoURL,
        name: displayName
      });
    }

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: 'smooth' });

    const messaging = mes.getMessaging();
    mes.getToken(messaging, { vapidKey: 'BF36G3JsgP78J61qmmLskcGMaRx_P2i6-7Oe0pkW3zX67H-2vH4S7uk7HEVAW35dtA63uEW05R9vHOaEV9cz7AY' }).then((currentToken) => {
      if (currentToken) {
        const body2 = { name: displayName, body: formValue, token: currentToken };
        axios.post('https://us-central1-texter-1f7e3.cloudfunctions.net/sendNotification2', body2, {
          headers: {
            "Access-Control-Allow-Headers": "*", // this will allow all CORS requests
            "Access-Control-Allow-Methods": "*", // this states the allowed methods
            "Content-Type": "application/json"
          }
        }).then(response => console.log("Response: " + response.data)).catch(error => {
          console.error('There was an error!', error);
        });

      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
  }
  setTimeout(function () {
    if (messages !== undefined) {
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, 5)


  return (
    <div className="dark:bg-black">
      {<SignOut />}
      <List className="darkGray messages" sx={{ width: '100%', maxWidth: 360, }}>
        {messages && messages.map((msg, i) => <Message key={i} message={msg} />)}

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
          onChange={(e) => {
            setFormValue(e.target.value);
            dummy.current.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <Button className="send" type="submit" variant="outlined" color="success">
          Send
        </Button>
      </form>
      <div className="photoDisp">

        <Switch
          checked={checked}
          onChange={handleChange}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        <div>Show Photo</div>
      </div>

    </div>
  )
}


function Message(props) {
  const { message, idK, photo, name } = props.message;
  const mC = idK === auth.currentUser.uid ? 'sent' : 'recieved';

  return (
    <div className={`message ${mC}`}>
      <ListItem className={`message ${mC}`}>
        <ListItemAvatar>
          <Avatar>
            {photo === "" ? name.substring(0, 1): <img src={photo} alt="dsf" />}
          </Avatar>
        </ListItemAvatar>

        <ListItemText primary={name} secondary={message} />

      </ListItem>
      <Divider className={`divider ${mC}D`} variant="inset" component="li" />
    </div>
  )
}

export default App;
