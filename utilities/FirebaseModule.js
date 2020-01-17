import * as firebase from 'firebase';
import '@firebase/firestore';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Product } from '../models/Product';

export function initializeApp() {
    const firebaseConfig = {
        apiKey: "AIzaSyBb352VEWRyi8Ol24fbmEkS8IBx-tDdDFo",
        authDomain: "myspace-632e9.firebaseapp.com",
        databaseURL: "https://myspace-632e9.firebaseio.com",
        projectId: "myspace-632e9",
        storageBucket: "myspace-632e9.appspot.com",
        messagingSenderId: "998862870360",
        appId: "1:998862870360:web:8cce7e0ea60f7298a3772d",
        measurementId: "G-FGHFDNY8K8"
    };
    firebase.initializeApp(firebaseConfig);
    // firebase.analytics(app);
}

export function getProducts() {
    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('productos');
    const arrayProducts = [];
    docRef.get().then((doc) => {
        return new Promise((resolve) => {
            if (doc.empty) {
                alert("Sin datos");
            } else {
                doc.docs.forEach((element) => {
                    let aux = element;
                    aux['$key'] = element.id;
                    arrayProducts.push(aux);
                });
            }
            resolve(arrayProducts);
        });
    }).catch((error) => {
        alert('Hemos tenido un error al obtener los datos')
    });
}

/**
 * Clave autogenerada con firebase
 */
export function addProduct(product: Product) {
    const dbFirestore = firebase.firestore();
    dbFirestore.collection("productos").add(product).catch(error => { alert(error) })
}

/** Tomar producto segun una key **/
export async function getProductsByKey(key: string) {
    let auxProducts = {};

    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('productos').doc(key)
    docRef.get().then((doc) => {
        return new Promise((resolve) => {
            if (doc.exists) {
                alert("Sin datos");
            } else {
                let aux = doc.data;
                aux['$key'] = doc.id;
                auxProducts = aux;
            }
            resolve(auxProducts);
        });
    }).catch((error) => {
        alert('Hemos tenido un error al obtener los datos')
    });
}

export async function getChatByKey(key: string) {
    let auxChat = {};
    alert(key);
    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('chat').doc(key)
    docRef.get().then((doc) => {
        return new Promise((resolve) => {
            if (!doc.exists) {
                alert("Sin datos");
            } else {
                let aux = doc.data;
                aux['$key'] = doc.id;
                auxChat = aux;
            }
            resolve(auxChat);
        });
    }).catch((error) => {
        alert('Hemos tenido un error al obtener los datos')
    });
}

export function getTransactionByKey(key: string) {
    let auxChat = {};

    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('transacciones').doc(key)
    docRef.get().then((doc) => {
        return new Promise((resolve) => {
            if (doc.exists) {
                alert("Sin datos");
            } else {
                let aux = doc.data;
                aux['$key'] = doc.id;
                auxChat = aux;
            }
            resolve(auxChat);
        });
    }).catch((error) => {
        alert('Hemos tenido un error al obtener los datos')
    });
}


export function getCategory() {
    let auxCategory = [];

    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('chat')
    docRef.get().then((doc) => {
        return new Promise((resolve) => {
            if (doc.empty) {
                alert("Sin datos");
            } else {
                doc.docs.forEach((element) => {
                    let aux = element;
                    aux['$key'] = element.id;
                    auxCategory.push(aux);
                });
            }
            resolve(auxCategory);
        });
    }).catch((error) => {
        alert('Hemos tenido un error al obtener los datos')
    });
}





























// SingUp User
export function SingUp(email, password, name, navigator) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(e => {
            firebase.auth().onIdTokenChanged(function (user) {
                if (user) {
                    let userJson = {
                        uid: user.uid,
                        nombre: name,
                        token: '',
                        email: user.email
                    }

                    Permissions.getAsync(
                        Permissions.NOTIFICATIONS
                    ).then(e => alert("oka")).catch(e => { alert(e) });

                    Permissions.askAsync(Permissions.NOTIFICATIONS).then(e => alert("oka")).catch(e => { alert(e) });

                    Notifications.getExpoPushTokenAsync().then(e => {
                        let aux = e.split("ExponentPushToken[");
                        const token = aux[1].split("]");

                        if (token[0]) {
                            alert("buscando token");
                            userJson.token = e;
                            // addClient(userJson);
                            navigator.navigate("Home")
                        } else {
                            alert("Algo ha fallado.");
                        }
                    });



                } else {
                    alert("Usuario no tiene token habilitado")
                }
            });
        }).catch(e => {
            alert(e + "");
            return e;
        });
}

// SingIp User
export function SingIn(email, password, props) {
    try {
        firebase.auth().signInWithEmailAndPassword(email, password);
        firebase.auth().onAuthStateChanged(user => {
            props.navigate("Home")
        })
    } catch (error) {
        alert("¡Ups! Hemos tenido un error al iniciar sesión. Por favor verificá que hayas escrito bien la contraseña y el email.");
    }
};


export function LogOut(props) {
    firebase.auth().signOut().then(function () {
        props.navigate("Login")
    }, function (error) {
        alert(error);
    });
};


export function VerifiyAuth(props) {
    firebase.auth().onIdTokenChanged(function (user) {
        if (user) {
            props.navigate("Home");
        } else {
            props.navigate("Login");
        }
    });
}

