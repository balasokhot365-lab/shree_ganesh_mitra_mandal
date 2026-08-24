
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export const serviceAccount = {
  type: "service_account",
  projectId: "ganesh-mitra-mandal",
  privateKeyId: "5c25588cf1ad276baff934d50d9a9ef3e7c37959",
  privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDR+VK6xzmKnLj5\nTvaiaRPIsDRcnnztDp6yQdQ6kPJU4gl2cjVttb8zf9RUiVwnPjM5wqr4RI2+4lXl\nZu8ZB7u2F4rLj0pV0Wt9viXM3aTAbn3VDpg0zIZ2gBXEz8wA142jDuY7Mz7GJ0jT\n3dGM6YiMzrV8nkgNdvGL4VTFcMF0AUf0nOQsUykDHiiymiDSshhIsr5tTIKSS8ck\nZqpP9u6BsYGU5WFa5GamhNNoggBX4WzgnDT0N/GC3kqqyYEGjRucjbDKoHNv66EY\nhL5QNYWvCye08RhllPH+ZwJpYvhpQdz+RwVlG/WR4O/upPAXyLPJTQ38s+NMi9Yi\nTUS0yUJDAgMBAAECggEAN3HwNAzud1kqCP8eZkV76WcJ9JkPIOPW6Pg0C+EBdIOZ\nfxLqY9V1ryomjcoVsPEeQrbSQauMiGaoyuIy6beejBdMWbM1LFMX4MTIo3+1hPDI\nPm3TqEGHkhwBY46Bbol8x51kEybVgSqXcwakUmLKYXAmAUmkehW587dlFJvRIYnI\nmzcnlJY2Kfz0pMZSa6c0Yz4sZv0NXSSMbv+XZj6B+4sDcQToXSMG+9+806pWl7XC\n7Z0ViQG3D5b0u6H/hFQK7KfoIdFXT0S5jQaXNLAwSkoFBibDtgPd2e+eC14/4TbM\nURbbkyJC2ZeujN6I9xn25b9qqJf/JSK0+3FbQ8J3mQKBgQDrGm7Qk6Cu9T5BCX1G\ndqqTm6JqJRLyzCmRK5gIWSbgW920XO4/pLY58tHRjcVV0mAQn/jfr4ZU6DqJ5vTv\ncdunPoWxMvcE8ItwZQ7NvNsrL+Ttg258O03EbXQZ6jwhA7FcrwnWcEeOuSizpbej\nik/pYFvmpnY5xRGu0eeCW2oNaQKBgQDkoxgttb0nUkw9SVBYLnzAh3s2uxIj95pI\ny5ePVbQlGxDFajJ5uMr+Ro+LpSeDE0aqylDvF4MnQvgCUZpXXZiIM6be7RtE58yF\nnc8fi+2tWj5fSqs2Hnb2GG5N3acBD8yr1QgU4kRVRlAimJnHwQTfcybj+/jGcK0M\nDkZ2J/egywKBgBPyEiSv4Zn2RGnQHEi2GJKdSZInwwvGNmCSijtrFNlD8fMzTyMn\nHi6cYyCcHnnBd1TxvXN8uLDLYuwAJBeMWU4/B6iY4kwQ/EN0z2S0+QMY9RsRY3Y2\nscpQXuEz9hX28j0ivHrs26VIICPdk07UlSL/gcx3ouAT0AQ82p88kirBAoGBAKLk\noAFRDibJt4+igB+TX0Y8QEjKFy6Q5dcfVifEw8f79ILyGmwmgFmRJAw16mS0gxCD\nfA4cDlEWoWPlh7Te9iFzy1vgSiFZlJlNyZeMNhXfybhSlpDEO7UxysSnOqjC/Osf\np9ZZLp4irk03s7hhiHs6q2aayq9275M7SHA+IWrpAoGBAMoHDLK0YerzDNqn/xT5\ntggIUvbX4TDKRW66Gr+atGFkoyDcUW4/WbWFzSHwV/CQ6oECxghU3kD7WDO0ft5D\nYCzLzRobMYbOezgSRrpklpRHvOUQMuYClf205LpL27T8JBqwy6KFwliXr1Ki5abg\nHcUAfsbLgYAD5cDoZ1lgDuQ6\n-----END PRIVATE KEY-----\n`,
  clientEmail: "firebase-adminsdk-fbsvc@ganesh-mitra-mandal.iam.gserviceaccount.com",
  clientId: "109287323294261246673",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ganesh-mitra-mandal.iam.gserviceaccount.com",
};

let app: App;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: "ganesh-mitra-mandal",
  });
} else {
  app = getApps()[0];
}

export const firestore = getFirestore(app);
export default firestore;