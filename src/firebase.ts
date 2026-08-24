// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBpPKpL9l_IghfBbOZ8NG2pk6uwzdhcenI",
//   authDomain: "ekdant-mandel-2026.firebaseapp.com",
//   projectId: "ekdant-mandel-2026",
//   storageBucket: "ekdant-mandel-2026.firebasestorage.app",
//   messagingSenderId: "232512082733",
//   appId: "1:232512082733:web:54c28f244af0b3afabf9a4"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export const serviceAccount = {
  type: "service_account",
  projectId: "ekdant-mandel-2026",
  privateKeyId: "84bdfc30905238ed6e299e85d0e4a14138fdd834",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDD4IHs8IVQIJyD
f0cNDiAUiMewg+0V5tK5+n9tmOPlwTIf+sh9jhd7aYHAB7g8qqaQsrDLjmYKSZMB
yDxee4sBIhNynFknggEDEx5XJM1PPN6Fc18i/v+Df4giRZ3+cJKkOySDnGjrkEad
09k6PUdLyfI6t1v0zYbLf/OwrLdp116VOLImpBaLsEjJO4LEcmiWz03EqtBmbFLD
YPjjQ+crdshbtd7waj5W5bZKoO259Mo2YL2dONWC98YC9gv5HtWCeaEfTwUBPalq
q3d4NZTzg5T9H76bUlRFQR1R2WiCA0W+a6Bot9Nui9HiiPzPuzHJYvQDaS7jSJVu
nAiTU+wjAgMBAAECggEAQ71aIV9isz278uvq3fRzGrbc3EobjVX4rVGYjQXxVo0U
MSQQ/v7LVyY7NXZV/EEF/oeVhaf22PrtyJF/cytlfJxUvm+ck4GtqOsNNJTpHcyO
pfcqwRcPtWG+6h9KTuqOhBZh/9PxIvoPudhASRhVFjw+NZkgx43mXm0fEQwCGCtD
7MUAD9RJ9Eg9vJZyqd8d7Rr0Lgi1WjU6TmvM+FuM14iwzNbTmve4UBQh+h+3a29o
XYOdbgpDsddyvVf3SpjhNamX5NeRRI88gh67EIz0AO2AzDgQhphjZpzHD4KSKhEv
89pnq30zOajhWGEtsEHBWgY8PSmPATvYq1h+ppEVsQKBgQD49UqwR4EJS6znEiA4
zm6EQOF38E2Vjn0Z3CXbqPjeKrntuirVjBDWVMjV1JTBjaG4vqTacha41cKSZucS
N/453Ma/JzCnVSpmXUdmM4keYO9PUGzW1OI/RIy8yeiNgto1eBY5W9h/GeWrgyfH
PNPoLRRTqSyzfWlL8DjRX9ytMQKBgQDJatq75OehUtn002p6CQ+28vTLqIpCavl0
n/rHKBFtao5wM6I+SLkhQeW7px98of0OvDMy/WnrKEGOwL4zvkSLvMy20/OrN8kV
6aUAX4Q6pEAdYGD2K0hFrHrdmXgxSlwfj/USOXv2kK6Ky5TwxRayqf71WCeSnhiC
eFwWoXHJkwKBgHMLfyk40cNG6i6ZrLQziNSq2sY/EMs03lCt7/yy99ZKrkLSDetC
36D76xcNNnS/C2XBC5M6t49QkKpwzQUZROzePiWlaZFaBM7q+gybchjMuKnRQ4p/
M9ICznqLX2DNgCLHTJXTAJezkvOQFzi1vkMDWepTOinzoU4LQ2ZVwzdxAoGAKh6/
WTWYPsM9sxYXGSgV8jNCf+hh6VvHiNz/q3A0nMYAvXP+xLmehVbrfN+JFR4m9lLi
/hHCeZu0ge7Kl7V9Th+QS9dtCGwlEAEJMVfIJh89DSeffzsz5OYZ14eFfAFJ3IvV
OxdsVfaRmZLTNbpxcbFdEN97fwyyoW4cC9t9GSMCgYEAmmoK/Oi/N0KiVRK5aguV
7FwW6zp6ZIwuR2OHBk6wHfTLfVoWYVjYQl/J8Pxt3wgFbYO6HKYXYQ315nBYcR+w
C4+K2I4yaHjpdlrruUxroWj4JlZz4kgaS3pLjZlaew1+a6WNWXnEe4f5Ob+5eb4G
yPbjgBlF6AVG+21Hy76OSIA=
-----END PRIVATE KEY-----`,
  clientEmail: "firebase-adminsdk-fbsvc@ekdant-mandel-2026.iam.gserviceaccount.com",
  clientId: "117965604224589203770",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ekdant-mandel-2026.iam.gserviceaccount.com",
};

let app: App;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: "ekdant-mandel-2026",
  });
} else {
  app = getApps()[0];
}

export const firestore = getFirestore(app);
export default firestore;