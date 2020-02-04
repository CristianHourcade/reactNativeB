import * as firebase from 'firebase';
import '@firebase/firestore';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Product } from '../models/Product';
import * as ImageManipulator from 'expo-image-manipulator';
import { AsyncStorage } from 'react-native';
import { Clients } from '../models/Clients';
import { getReservationsForKey } from './ReservationModule';
import { getProductsWithKey } from './ProductsModule';


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


    const dbFirestore = firebase.firestore();

    if (user.chat === undefined) {
        user.chat = [keyReserva]
    } else {
        user.chat.push(keyReserva);
    }
    dbFirestore.collection('clientes').doc(user.$key).update(user).then(re => {
        AsyncStorage.setItem("Usuario", JSON.stringify(user));
    })


    var docRef = dbFirestore.collection('clientes').doc(keyRentador);
    docRef.get().then(async (doc) => {
        if (!doc.exists) {
            alert("Surgió un error, volvé a intentarlo en un instante. Si el problema persiste, contacta al equipo de Rentify");
        } else {
            let userDos = doc.data();
            if (userDos.reservas === undefined) {
                userDos.reservas = [keyReserva];
            } else {
                userDos.reservas.push(keyReserva);
            }
            if (userDos.chat === undefined) {
                userDos.chat = [keyReserva]
            } else {
                userDos.chat.push(keyReserva);
            }
            const newChat = {
                messages: [messageToSendNow],
                razon: keyReserva,
                keyRentador: keyRentador,
                keyCliente: keyCliente,
                fotoRentador: userDos.foto,
                fotoCliente: user.foto,
                status: 0
            }
            await dbFirestore.collection('chat').doc(keyReserva).set(newChat);

            dbFirestore.collection('clientes').doc(user.$key).update(userDos).then(e => {
                fetch('http://changofree.com/phpServer/sendNotification.php?type=message&token=' + userDos.token).then(e => {
                    alert('se envio');
                }).catch(e => 'algo fallo');
            });
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
                var data = {
                    to: DataIntegrantes.token,
                    sound: 'default',
                    title: 'Mensaje ' + user.nombre,
                    body: message.message
                };

                var params = typeof data == 'string' ? data : Object.keys(data).map(
                    function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
                ).join('&');

                var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                xhr.open('POST', 'https://exp.host/--/api/v2/push/send');
                xhr.onreadystatechange = function () {
                    if (xhr.readyState > 3 && xhr.status == 200) { alert(xhr.responseText); }
                };
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send(params);

                fetch('http://changofree.com/phpServer/sendNotification.php?type=message&token=' + doc.data().token).then(e => {
                    alert('se envio');
                }).catch(e => 'algo fallo');
            }
        });

    })

}


/** Update chat actual **/
export async function updateChatWithoutEditUser(key, message) {
    const dbFirestore = firebase.firestore();
    await dbFirestore.collection('chat').doc(key).update(message);

    const user = await AsyncStorage.getItem('Usuario');
    let userData = JSON.parse(user);
    const productData = [];
    const reservaData = [];
    const data = userData.reservas.map(async e => {
        return getChatByKeyToFindStatus(e).then(async eChat => {
            if (eChat !== null) {
                await getReservationsForKey(e).then(async (eValue: any) => {
                    await getProductsWithKey(eValue.keyProduct).then(eValueProduct => {
                        return productData.push(eValueProduct);
                    })
                    const result = Object.assign({}, eValue, eChat);
                    return reservaData.push(result);
                });
            } else {
                await getReservationsForKey(e).then(async (eValue: any) => {
                    await getProductsWithKey(eValue.keyProduct).then(eValueProduct => {
                        return productData.push(eValueProduct);
                    })
                    return reservaData.push(eValue);
                });
            }
        });
    });

    await Promise.all(data).then(async e => {
        await AsyncStorage.setItem('Pr', JSON.stringify(productData)).then(async e => {
            await AsyncStorage.setItem('ListMensajes', JSON.stringify(reservaData));
        })
    });
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


export async function getChatByKeyToFindStatus(key) {
    return new Promise(resolve => {

        const dbFirestore = firebase.firestore();
        var docRef = dbFirestore.collection('chat').doc(key);
        docRef.get().then((doc) => {
            if (!doc.exists) {
                resolve(null)
            } else {
                resolve(doc.data());
            }
        });
    })
}