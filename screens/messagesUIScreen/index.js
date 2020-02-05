import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar, AsyncStorage, TouchableHighlight, BackHandler, Keyboard } from 'react-native';
import Constants from 'expo-constants';
import { Dimensions } from "react-native";
import NavbarComponent from '../../navigation/Navbar';
import { getProducts, getProductsWithKey } from '../../utilities/ProductsModule';
import { getReservationsForKey } from '../../utilities/ReservationModule';
import { createNewChat, updateChat, getChatByKeyToFindStatus, updateChatWithoutEditUser } from '../../utilities/ChatsModule';
import { getChatByKey } from '../../utilities/ChatsModule';
import { getClientsByKeyPantallaProducto } from '../../utilities/ClientsModule';
import { Notifications } from 'expo';
import registerForPushNotificationsAsync from './FirebaseFCModule';
//screen A
import { DeviceEventEmitter } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay';

var width = Dimensions.get('window').width - 30; //full width
var he = Dimensions.get('window').height; //full width

export default class UIMessagesScreen extends Component<any> {

    state = {
        activeTab: 1,
        isOpenKeyboard: false,
        marginKeyboard: 0,
        messageToSend: '',
        receiber: null,
        chatJSON: null,
        user: null
    }

    listView;

    keyboardDidShowListener;

    keyboardDidHideListener;

    heLayout;

    _notificationSubscription;




    async componentDidMount() {
        const user = await AsyncStorage.getItem('Usuario');
        let userData = JSON.parse(user);
        this.setState({ user: userData });

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow,
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide,
        );

        this.autoNotification();

        this._notificationSubscription = Notifications.addListener(this._handleNotification);


        const dataReserva = await JSON.parse(await AsyncStorage.getItem("chat"));

        getClientsByKeyPantallaProducto(dataReserva.keyRentador).then((e: any) => {
            getChatByKey(dataReserva.key).then((e: any) => {
                this.setState({ chatJSON: e });
                if (e.messages !== undefined) {
                    let x = e.messages[e.messages.length - 1].status;
                    let y = e.messages[e.messages.length - 1].own;
                    if (x === 0) {
                        if (y !== this.state.user.$key) {

                            this.state.chatJSON.messages[e.messages.length - 1].status = 1;
                            updateChatWithoutEditUser(this.state.chatJSON.razon, this.state.chatJSON).then(e => {
                                DeviceEventEmitter.emit('your listener', {})

                            })

                        }
                    }
                }
            });
            this.setState({ receiber: e });

        })
    }


    autoNotification = () => {
        AsyncStorage.setItem('isNotifcationR', 'true');
    }

    _handleNotification = async notification => {
        // do whatever you want to do with the notification
        const dataReserva = await JSON.parse(await AsyncStorage.getItem("chat"));

        getChatByKey(dataReserva.key).then(e => {
            this.setState({ chatJSON: e });
        });

        this.forceUpdate()
    };


    _keyboardDidShow = (e) => {
        this.setState({ isOpenKeyboard: true, marginKeyboard: e.endCoordinates.height + 28 });
    }

    _keyboardDidHide = () => {
        this.setState({ isOpenKeyboard: false });
    }

    sendMessage = () => {
        var currentdate = new Date();

        var datetime = currentdate.getHours() + ":"
            + ((currentdate.getMinutes().toString().length === 1) ?
                '0' + currentdate.getMinutes() :
                currentdate.getMinutes());

        const messageToSendNow = {
            message: this.state.messageToSend,
            status: 0,
            own: this.state.user.$key,
            time: datetime,
            date: currentdate
        }

        this.state.messageToSend = '';
        Keyboard.dismiss();

        this.listView.scrollTo({ y: this.heLayout + 500 });

        this.state.chatJSON.messages.push(messageToSendNow);
        this.forceUpdate();
        let keyToSend = null;

        if (this.state.chatJSON.keyCliente === this.state.user.$key) {
            keyToSend = this.state.chatJSON.keyRentador;
        } else {
            keyToSend = this.state.chatJSON.keyCliente;
        }

        updateChat(this.state.chatJSON.razon, this.state.chatJSON, keyToSend).then(async e => {

            const user = await AsyncStorage.getItem('Usuario');
            let userData = JSON.parse(user);

            const reservaData = [];
            const productData = [];

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

            this.autoNotification();
            await Promise.all(data).then(async e => {
                await AsyncStorage.setItem('Pr', JSON.stringify(productData)).then(async e => {
                    await AsyncStorage.setItem('ListMensajes', JSON.stringify(reservaData)).then(async e => {
                        this.setState({ reservations: reservaData, products: productData });
                    });
                })
            });

        });

    }

    render() {

        let index = 0;
        if (this.state.receiber === null || this.state.chatJSON === null) {
            return <Spinner
                visible={true}
                textContent={''} />
        }
        return (
            <View style={{ backgroundColor: 'white', position: 'relative' }}>

                <View style={{ height: (he - 50), width: width + 30, backgroundColor: '#f8f9fa', marginTop: 50 }}>
                    <ScrollView
                        ref={ref => this.listView = ref}>
                        <View style={{ paddingBottom: 60 }}
                            onLayout={(event) => {
                                this.heLayout = event.nativeEvent.layout.height;
                                this.listView.scrollTo({ y: this.heLayout + 5000 })
                            }}>



                            {
                                this.state.chatJSON.messages.map(e => {
                                    index++;

                                    return (
                                        <View 
                                        key={index}
                                        style={{
                                            width: (width + 30) * 70 / 100,
                                            marginLeft: (e.own === this.state.user.$key) ? (width + 30) * 30 / 100 - 15 : 15,
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 0.29,
                                            shadowRadius: 4.65,
                                            elevation: 7,
                                            backgroundColor: (e.own === this.state.user.$key) ? '#DEDEDE' : '#ff5d5a', borderRadius: 25,
                                            borderTopRightRadius: (e.own === this.state.user.$key) ? 0 : 25,
                                            borderTopLeftRadius: (e.own === this.state.user.$key) ? 25 : 0,
                                            marginTop: (index === 1) ? 50 : 15, marginBottom: 15, padding: 15
                                        }}>
                                            <Text style={{ color: (e.own === this.state.user.$key) ? '#171717' : '#ffffff', fontFamily: 'font1' }}>
                                                {e.message}
                                            </Text>
                                            <Text style={{
                                                color: (e.own === this.state.user.$key) ? '#747474' : '#171717', fontFamily: 'font1', fontSize: 12, fontStyle: 'italic', marginTop: 5,
                                                position: 'absolute', right: 15, bottom: 5
                                            }}>
                                                {e.time}
                                            </Text>
                                        </View>
                                    )
                                }
                                )
                            }
                        </View>

                    </ScrollView>
                </View>



                <View style={{
                    width: width + 30, height: 50, position: 'absolute', top: 0, left: 0,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 12,
                    },
                    shadowOpacity: 0.23,
                    shadowRadius: 2.62,

                    elevation: 5,
                    flexDirection: 'row', backgroundColor: 'white'
                }}>

                    <TouchableOpacity style={{ flex: 0.2, elevation: 11, justifyContent: "center", alignItems: 'flex-start' }} onPress={() => { this.props.navigation.goBack() }}>
                        <Image source={require('../../assets/arrow_b.png')} style={{ width: 25, height: 25, marginLeft: 15 }} />
                    </TouchableOpacity>

                    <View style={{ flex: 0.6, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <View style={{
                            paddingBottom: 3,
                            paddingTop: 25,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: -1,
                                height: 12,
                            },
                            shadowOpacity: 0.23,
                            shadowRadius: 2.62,

                            elevation: 4,
                            position: 'absolute', flex: 1, width: width * 60 / 100, justifyContent: 'center',
                            alignItems: 'center', backgroundColor: 'white', bottom: -45, borderBottomRightRadius: 50, borderBottomLeftRadius: 50
                        }}>
                            <Image source={{ uri: this.state.receiber.foto }} style={{ width: 60, height: 60, borderRadius: 25, marginTop: 30 }} />
                            <Text style={{ fontFamily: 'font1', marginTop: 5 }}>{this.state.receiber.name}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => { }} style={{ flex: 0.2, elevation: 11, justifyContent: "center", alignItems: 'flex-end' }}>
                        <Image source={require('../../assets/option.png')} style={{ width: 18, height: 18, marginRight: 25 }} />
                    </TouchableOpacity>
                </View>


                <View style={{ width: width + 30, minHeight: 50, position: 'absolute', bottom: this.state.isOpenKeyboard ? this.state.marginKeyboard : 0, left: 0, flexDirection: 'row', elevation: 10, backgroundColor: 'white' }}>

                    <View style={{ flex: 0.9, elevation: 11, justifyContent: "center", alignItems: 'center' }}>
                        <TextInput style={{
                            minHeight: 32.5,
                            padding: 5,
                            paddingLeft: 15,
                            fontSize: 12,
                            width: (width * 90 / 100) - 30,
                            backgroundColor: '#eee',
                            borderRadius: 12,
                        }} value={this.state.messageToSend} onChangeText={(e) => { this.setState({ messageToSend: e }) }}
                            keyboardType='web-search'
                            multiline={true}
                            placeholderTextColor="#000000" placeholder="Escribí tu mensaje acá" />
                    </View>


                    <TouchableOpacity onPress={() => { this.sendMessage() }} style={{ flex: 0.2, elevation: 11, justifyContent: "center", alignItems: 'center' }}>
                        <Image source={require('../../assets/send.png')} style={{ width: 18, height: 18 }} />
                    </TouchableOpacity>
                </View>
            </View >
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        flexDirection: 'row',
    },
    btnGuardados: {
        backgroundColor: '#ff5d5a',
        position: 'relative',
        marginLeft: 15,
        marginRight: 5,
        height: 50,
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    btnIcons: {
        flex: 1,
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnMapa: {
        borderColor: '#ff5d5a',
        borderWidth: 2,
        marginRight: 15,
        marginLeft: 5,
        height: 50,
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    titleSection2: {
        fontFamily: 'font2',
        fontSize: 22,
        textAlign: 'center'
    },
    titleSection3: {
        fontSize: 25,
        fontFamily: 'font2',

    },
    descriptionSection2: {
        fontFamily: 'font1',
        fontSize: 14,
        textAlign: 'center'
    },
    titleSection: {
        fontFamily: 'font2',
        fontSize: 28
    },
    btnVerMas: {
        backgroundColor: '#ff5d5a',
        marginLeft: 15,
        marginRight: 15,
        height: 50,
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        marginTop: 30
    },
    btnOutline: {
        borderColor: '#ff5d5a',
        borderWidth: 2,
        marginLeft: 30,
        marginRight: 30,
        height: 50,
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    btnMatch: {
        backgroundColor: '#FFF',
        height: 45,
        marginLeft: 40,
        marginRight: 40,
        width: 270,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 5,
        left: width / 2 - 135 - 28,
        position: 'absolute',
        bottom: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    descriptionSection: {
        fontFamily: 'font1',
        fontSize: 14,
        color: '#6A6A6A'
    },

    icon: {
        width: 25,
        height: 25,
        position: 'relative',
        top: 13,
        left: 11
    },
    icon2: {
        width: 25,
        height: 25,
        position: 'relative',
        top: -3,
        right: -4
    },
    containerData: {
        marginTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
        flexDirection: 'column',
    },
    logoCont: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buscadorGroup: {
        marginTop: 8,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textLogo: {
        fontSize: 28,
        fontFamily: 'font2'
    },
    inputBuscador: {
        minHeight: 32.5,
        width: width * 90 / 100,
        padding: 5,
        fontSize: 14,
        backgroundColor: '#eee',
        borderRadius: 12,
    },
    searchIcon: {
        position: 'absolute',
        right: 20,
        top: 17,
        height: 25,
        width: 25
    },
    anuncio1: {
        marginLeft: 10,
        marginRight: 10,
        width: width,
        height: 200,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    titleSectionContent: {
        marginTop: 15,
        width: width,
        marginLeft: 15,
    }
});