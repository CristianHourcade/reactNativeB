import * as firebase from 'firebase';
import '@firebase/firestore';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Product } from '../models/Product';
import * as ImageManipulator from 'expo-image-manipulator';
import { AsyncStorage } from 'react-native';
import { Clients } from '../models/Clients';


class Imgupload {
    $key: number;
    name: string;
    url: string;
    file: File;

    constructor(file: File) {
        this.file = file;
    }
}


/** Clave autogenerada con firebase **/
export async function addClient(client: any) {
    const dbFirestore = firebase.firestore();
    dbFirestore.collection('clientes').doc(client.$key).set(client);
}

/** Clave autogenerada con firebase **/
export async function updateClient(client: any, image?: any, deleteImg: any, ) {

    const dbFirestore = firebase.firestore();

    if (deleteImg !== undefined) {
        firebase.storage().refFromURL(client.foto).delete();
    }

    if (image !== undefined && image !== null) {

        await uploadImages(image).then(data => {
            client.foto = data;
            dbFirestore.collection('clientes').doc(client.$key).update(client).then(e => {
                AsyncStorage.setItem("Usuario", JSON.stringify(client));
            })
        });
    } else {
        dbFirestore.collection('clientes').doc(client.$key).update(client).then(e => {
            AsyncStorage.setItem("Usuario", JSON.stringify(client));
        })
    }

}


async function uploadImages(element) {
    return new Promise(resolve => {
        var x = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var file;
        ImageManipulator.manipulateAsync(
            element.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
        ).catch(e => alert(e + ''))
            .then(data => {
                //@ts-ignore
                fetch(data.uri)
                    .then(res => res.blob())
                    .then(blob => {
                        file = blob
                        const storageRef = firebase.storage().ref();
                        const uploadTask = storageRef.child(`uploads/${x}`).put(file);
                        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                            (snapshot) => {
                                // in progress
                                // const snap = snapshot as firebase.storage.UploadTaskSnapshot;
                            },
                            (error) => {
                                // fail
                                alert(JSON.stringify(error));
                            },
                            () => {
                                // success
                                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                                    console.log("termino");
                                    resolve(downloadURL);
                                });
                            }
                        );
                    });
            });
    });

}

/** Tomar producto segun una key **/
export async function getClientsByKeyPantallaProducto(user) {
    return new Promise(resolve => {

        const dbFirestore = firebase.firestore();
        var docRef = dbFirestore.collection('clientes').doc(user);
        docRef.get().then((doc) => {
            if (!doc.exists) {
                alert("Surgió un error, volvé a intentarlo en un instante. Si el problema persiste, contacta al equipo de Rentify");
            } else {
                resolve(doc.data());
            }
        });
    })
}

/** Tomar producto segun una key **/
export async function getClientsByKeyWithoutRedirection(user) {
    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('clientes').doc(user.$key);
    docRef.get().then((doc) => {
        AsyncStorage.setItem("Usuario", JSON.stringify(doc.data()));
    });
}

/** Tomar producto segun una key **/
export async function getClientsByKey(user, prop) {
    const dbFirestore = firebase.firestore();
    var docRef = dbFirestore.collection('clientes').doc(user.$key);
    docRef.get().then((doc) => {
        if (!doc.exists) {
            addClient(user);
            AsyncStorage.setItem("Usuario", JSON.stringify(user));
        } else {
            AsyncStorage.setItem("Usuario", JSON.stringify(doc.data()));
        }

        prop.navigation.replace('Home');
    });
}


