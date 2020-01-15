import * as firebase from 'firebase';
import '@firebase/firestore';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Product } from '../models/Product';
import * as ImageManipulator from 'expo-image-manipulator';
import { AsyncStorage } from 'react-native';
import { Clients } from '../models/Clients';


/** Tomar producto segun una key **/
export async function getReservationsForKey(key) {
    return new Promise(resolve => {
        const dbFirestore = firebase.firestore();
        var docRef = dbFirestore.collection('reservas').doc(key);
        docRef.get().then((doc) => {
            if (!doc.exists) {
                alert("Surgió un error, volvé a intentarlo en un instante. Si el problema persiste, contacta al equipo de Rentify");
            } else {
                resolve(doc.data());
            }
        });
    })
}

