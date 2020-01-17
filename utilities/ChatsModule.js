import * as firebase from 'firebase';
import '@firebase/firestore';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Product } from '../models/Product';
import * as ImageManipulator from 'expo-image-manipulator';
import { AsyncStorage } from 'react-native';
import { Clients } from '../models/Clients';


/** Clave autogenerada con firebase **/
export async function createNewChat(keyReserva, keyRentador, keyCliente, user) {
    const newChat = {
        messages: [],
        razon: keyReserva,
        keyRentador: keyRentador,
        keyCliente: keyCliente,
        status: 0
    }

    const dbFirestore = firebase.firestore();
    const id = await (await dbFirestore.collection('chat').doc(keyReserva).set(newChat));

    if (user.chat === undefined) {
        user.chat = [keyReserva]
    } else {
        user.chat.push(keyReserva);
    }
    dbFirestore.collection('clientes').doc(user.$key).update(user).then(re => {
        AsyncStorage.setItem("Usuario", JSON.stringify(user));
    })
}


/** Update chat actual **/
export async function updateChat(key, message) {
   
    const dbFirestore = firebase.firestore();
    await dbFirestore.collection('chat').doc(key).update(message);

}



/** Tomar producto segun una key **/
export async function getChatByKey(key) {
    return new Promise(resolve => {

        const dbFirestore = firebase.firestore();
        var docRef = dbFirestore.collection('chat').doc(key);
        docRef.get().then((doc) => {
            if (!doc.exists) {
                alert("Surgió un error, volvé a intentarlo en un instante. Si el problema persiste, contacta al equipo de Rentify");
            } else {
                resolve(doc.data());
            }
        });
    })
}
