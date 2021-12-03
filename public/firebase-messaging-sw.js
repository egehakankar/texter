importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7u2BiZJH_NYkipybK6JQi076ltPLOSEQ",
  authDomain: "texter-1f7e3.firebaseapp.com",
  projectId: "texter-1f7e3",
  storageBucket: "texter-1f7e3.appspot.com",
  messagingSenderId: "583050695852",
  appId: "1:583050695852:web:8321b99894f47fc13c3b09"
});

const messaging = firebase.messaging();