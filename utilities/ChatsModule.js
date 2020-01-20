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
    var currentdate = new Date();

    var datetime = currentdate.getHours() + ":"
        + ((currentdate.getMinutes().toString().length === 1) ?
            '0' + currentdate.getMinutes() :
            currentdate.getMinutes());

    const messageToSendNow = {
        message: "Hola " + user.name +
            '! Como estás? Gracias por tu reserva! ¿Te gustaría ir dejando tu mensaje acá? En la bebredad te estaré contestando. Saludos!',
        status: 0,
        own: keyRentador,
        time: datetime,
        date: currentdate
    }
    const newChat = {
        messages: [messageToSendNow],
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


    var docRef = dbFirestore.collection('clientes').doc(keyRentador);
    docRef.get().then((doc) => {
        if (!doc.exists) {
            alert("Surgió un error, volvé a intentarlo en un instante. Si el problema persiste, contacta al equipo de Rentify");
        } else {
            let user = doc.data();
            if (user.reservas === undefined) {
                user.reservas = [keyReserva];
            } else {
                user.reservas.push(keyReserva);
            }
            if (user.chat === undefined) {
                user.chat = [keyReserva]
            } else {
                user.chat.push(keyReserva);
            }
            dbFirestore.collection('clientes').doc(user.$key).update(user).then(e => {
                fetch('http://changofree.com/phpServer/sendNotification.php?type=message&token=' + user.token).then(e => {
                    alert('se envio');
                }).catch(e => 'algo fallo');
            })
        }
    });
}


/** Update chat actual **/
export async function updateChat(key, message, user) {

    const dbFirestore = firebase.firestore();
    await dbFirestore.collection('chat').doc(key).update(message).then(e => {
        var docRef = dbFirestore.collection('clientes').doc(user);
        docRef.get().then((doc) => {
            if (!doc.exists) {
                alert("Surgió un error, volvé a intentarlo en un instante. Si el problema persiste, contacta al equipo de Rentify");
            } else {
                fetch('http://changofree.com/phpServer/sendNotification.php?type=message&token=' + doc.data().token).then(e => {
                    alert('se envio');
                }).catch(e => 'algo fallo');
            }
        });

    })

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
