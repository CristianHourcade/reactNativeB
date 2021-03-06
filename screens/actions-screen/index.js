import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar, AsyncStorage, TouchableHighlight, BackHandler, DeviceEventEmitter } from 'react-native';

import { LogOut, getProductsByKey } from '../../utilities/FirebaseModule';


import StylesGlobal from '../../styles/styles';
import Carousel from 'react-native-snap-carousel';

import Constants from 'expo-constants';
import { Dimensions } from "react-native";
import MyCarousel from ' ../../../components/BannersCarrousel';
import CardPropiedadList from '../../components/Cards/cardPropiedadList';
import CardPropiedadHome from '../../components/Cards/cardPropiedadHome';
import Sidebar from '../../components/Sidebar';
import NavbarComponent from '../../navigation/Navbar';
import { Review } from '../../models/Review';
import { getProducts, getProductsWithKey } from '../../utilities/ProductsModule';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Geocoder from 'react-native-geocoding';
import * as Calendar from 'expo-calendar';
import { getReservationsForKey } from '../../utilities/ReservationModule';
import { createNewChat, getChatByKeyToFindStatus } from '../../utilities/ChatsModule';
import Receiver from '../receiverNotification';
import { Ionicons, AntDesign } from '@expo/vector-icons';

var width = Dimensions.get('window').width - 30; //full width
var he = Dimensions.get('window').height; //full width


export default class ActionScreen extends Component<any> {

    state = {
        activeTab: 1,
        reservations: [],
        products: [],
        user: null,
        isSort: false
    }


    async componentWillMount() {

    }


    getListOfReservations = async () => {
        const user = await AsyncStorage.getItem('Usuario');
        let userData = JSON.parse(user);
        this.setState({ user: userData });

        const reservaData = [];
        const productData = [];

        let dataSaved = await AsyncStorage.getItem('ListMensajes');
        let dataSavedProducts = await AsyncStorage.getItem('Pr');

        if (JSON.parse(dataSaved) !== null && JSON.parse(dataSavedProducts) !== null) {
            this.setState({ reservations: JSON.parse(dataSaved), products: JSON.parse(dataSavedProducts) });

            return;
        }

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
                await AsyncStorage.setItem('ListMensajes', JSON.stringify(reservaData)).then(async e => {
                    this.setState({ reservations: reservaData, products: productData });
                });
            })
        }).then(async edata => {

        })
    };

    getProductInfoFromListLocaly = (key) => {
        let toReturn = null;
        this.state.products.map(e => {
            if (e.$key === key) {
                toReturn = e;
            }
        });

        return toReturn;
    }


    async componentDidMount() {
        this.getListOfReservations();
    }

    getTextToShowDateReservation = (date) => {
        const result = date.split("|");
        let desde = result[0].split("-");
        let hasta = result[1].split("-");
        desde = desde[2] + "/" + (Number(desde[1]) + 1) + "/" + desde[0];
        hasta = hasta[2] + "/" + (Number(hasta[1]) + 1) + "/" + hasta[0];

        return "La reservación fue hecha desde el " + desde + " hasta el " + hasta;
    }
    getStatusReservation = (status) => {
        switch (status) {
            case 0:
                return 'Pendiente de Aprobacion';
                break;
            case 1:
                return 'Reserva Confirmada';
                break;
            case 2:
                return 'Reserva Cancelada';
                break;
            case 3:
                return 'Estadia finalizada';
                break;
        }
    }

    componentWillUpdate() {
        DeviceEventEmitter.addListener('your listener', (e) => { this.getListOfReservations() });
    }

    createChat = (keyReserva, keyRentador, keyCliente) => {
        let reservaJSON = null;
        this.state.reservations.map(e => {
            if (e.key === keyReserva) {
                reservaJSON = e;
            }
        });
        if (this.state.user.chat !== undefined) {
            let aux = false;
            this.state.user.chat.map(e => {
                if (e === keyReserva) {
                    aux = true;
                }
            });
            if (aux) {
                AsyncStorage.setItem("chat", JSON.stringify(reservaJSON)).then(e => {
                    this.props.route.navigate("Message");
                })
            } else {
                createNewChat(keyReserva, keyRentador, keyCliente, this.state.user).then(e => {
                    AsyncStorage.setItem("chat", JSON.stringify(reservaJSON));
                    this.props.route.navigate("Message");

                });
            }
        } else {
            createNewChat(keyReserva, keyRentador, keyCliente, this.state.user).then(e => {
                AsyncStorage.setItem("chat", JSON.stringify(reservaJSON));
                this.props.route.navigate("Message");
            });
        }

    }


    render() {


        if (!this.state.isSort) {
            let aux = [];
            this.state.reservations.map(eDate => {
                if (eDate.messages === undefined) {
                    aux.push(eDate);
                }
            });

            this.state.reservations.map(eDate => {
                if (eDate.messages[eDate.messages.length - 1].status === 0 && eDate.messages[eDate.messages.length - 1].own !== this.state.user.$key) {
                    aux.push(eDate);
                }
            })

            this.state.reservations.map(eDate => {
                if (eDate.messages !== undefined) {

                    if ((eDate.messages[eDate.messages.length - 1].status === 1 && eDate.messages[eDate.messages.length - 1].own !== this.state.user.$key) || (eDate.messages[eDate.messages.length - 1].status === 0 && eDate.messages[eDate.messages.length - 1].own === this.state.user.$key)) {
                        aux.push(eDate);
                    }
                }
            });
            this.setState({ reservations: aux.reverse(), isSort: true });
        }
        let index = 0;
        return (
            <View style={{ backgroundColor: 'white', position: 'relative' }}>
                <ScrollView>

                    {this.state.activeTab === 1 ?

                        <View style={{ paddingBottom: 95, marginTop: 50, minHeight: he }}>

                            <View style={styles.titleSectionContent}>
                                <Text style={styles.titleSection}>Mis Consultas</Text>
                                <Text style={styles.descriptionSection}>Este es el listado de tus ultimas conversaciones.</Text>
                            </View>

                            <View>
                                <View style={{
                                    flex: 1,
                                    borderRadius: 8,
                                    marginLeft: 15,
                                    marginRight: 15,
                                    padding: 15,
                                    height: 100,
                                    paddingLeft: 15,
                                    paddingRight: 30,
                                    flexDirection: 'row',
                                }}>
                                    <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: 'https://lh3.googleusercontent.com/-9TJWKte7-kg/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfZf8UxqORmoZ-flAgXTePmMnPCSw/photo.jpg?sz=46' }} style={{ width: 60, height: 60, borderRadius: 100 }} />
                                    </View>
                                    <View style={{ flex: 0.8, paddingLeft: 15 }}>
                                        <Text style={{ fontFamily: 'font2', fontSize: 15 }}>Toto sos capo</Text>
                                        <Text style={{ fontFamily: 'font1', fontSize: 12, color: '#6A6A6A' }}>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempus urna sed Lorem ipsum dolor sit amet, consectetur...
                                    </Text>

                                    </View>

                                </View>
                            </View>

                            <View>
                                <View style={{
                                    flex: 1,
                                    borderRadius: 8,
                                    marginLeft: 15,
                                    marginTop: 5,
                                    marginRight: 15,
                                    padding: 15,
                                    height: 100,
                                    paddingLeft: 15,
                                    paddingRight: 30,
                                    flexDirection: 'row',
                                }}>
                                    <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: 'https://lh3.googleusercontent.com/-9TJWKte7-kg/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfZf8UxqORmoZ-flAgXTePmMnPCSw/photo.jpg?sz=46' }} style={{ width: 60, height: 60, borderRadius: 100 }} />
                                    </View>
                                    <View style={{ flex: 0.8, paddingLeft: 15 }}>
                                        <Text style={{ fontFamily: 'font2', fontSize: 15 }}>Toto sos capo</Text>
                                        <Text style={{ fontFamily: 'font1', fontSize: 12, color: '#6A6A6A' }}>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempus urna sed Lorem ipsum dolor sit amet, consectetur...
                                    </Text>

                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={{
                                    flex: 1,
                                    borderRadius: 8,
                                    marginLeft: 15,
                                    marginTop: 5,
                                    marginRight: 15,
                                    padding: 15,
                                    height: 100,
                                    paddingLeft: 15,
                                    paddingRight: 30,
                                    flexDirection: 'row',
                                }}>
                                    <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: 'https://lh3.googleusercontent.com/-9TJWKte7-kg/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfZf8UxqORmoZ-flAgXTePmMnPCSw/photo.jpg?sz=46' }} style={{ width: 60, height: 60, borderRadius: 100 }} />
                                    </View>
                                    <View style={{ flex: 0.8, paddingLeft: 15 }}>
                                        <Text style={{ fontFamily: 'font2', fontSize: 15 }}>Toto sos capo</Text>
                                        <Text style={{ fontFamily: 'font1', fontSize: 12, color: '#6A6A6A' }}>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempus urna sed Lorem ipsum dolor sit amet, consectetur...
                                    </Text>

                                    </View>
                                </View>
                            </View>
                            <View>
                                <View style={{
                                    flex: 1,
                                    borderRadius: 8,
                                    marginLeft: 15,
                                    marginTop: 5,
                                    marginRight: 15,
                                    padding: 15,
                                    height: 100,
                                    paddingLeft: 15,
                                    paddingRight: 30,
                                    flexDirection: 'row',
                                }}>
                                    <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: 'https://lh3.googleusercontent.com/-9TJWKte7-kg/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfZf8UxqORmoZ-flAgXTePmMnPCSw/photo.jpg?sz=46' }} style={{ width: 60, height: 60, borderRadius: 100 }} />
                                    </View>
                                    <View style={{ flex: 0.8, paddingLeft: 15 }}>
                                        <Text style={{ fontFamily: 'font2', fontSize: 15 }}>
                                            Toto sos capo
                                        <Text>Pendiente de aprobación</Text>
                                        </Text>
                                        <Text style={{ fontFamily: 'font1', fontSize: 12, color: '#6A6A6A' }}>
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempus urna sed Lorem ipsum dolor sit amet, consectetur...
                                    </Text>

                                    </View>
                                </View>
                            </View>


                        </View>
                        : null}
                    {this.state.activeTab === 2 ?

                        <View style={{ paddingBottom: 95, marginTop: 50, minHeight: he }}>

                            <View style={styles.titleSectionContent}>
                                <Text style={styles.titleSection}>Mis Reservas</Text>
                                <Text style={styles.descriptionSection}>Encontrá el historial de reservas, pendientes y aprobadas.</Text>
                            </View>
                            {(this.state.products.length === 0 || this.state.reservations.length === 0) ?

                                <View>
                                    <Spinner
                                        visible={true}
                                        textContent={''} />
                                </View>
                                :
                                this.state.reservations.map(eDate => {
                                    index++
                                    return (
                                        <TouchableOpacity key={index} onPress={() => { this.createChat(eDate.key, eDate.keyRentador, eDate.keyInquilino); }}>
                                            <View style={{
                                                flex: 1,
                                                borderRadius: 8,
                                                marginLeft: 15,
                                                marginRight: 15,
                                                padding: 15,
                                                height: 100,
                                                paddingLeft: 15,
                                                paddingRight: 30,
                                                flexDirection: 'row',
                                            }}>
                                                <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                                    {eDate.fotoRentador === undefined ?
                                                        <Image source={require('../../assets/icons/message.png')} style={{ width: 60, height: 60, borderRadius: 100 }} />
                                                        :
                                                        <Image source={{ uri: (eDate.keyCliente === this.state.user.$key) ? eDate.fotoRentador : eDate.fotoCliente }} style={{ width: 60, height: 60, borderRadius: 100 }} />
                                                    }
                                                    {/* <Image source={{ uri: (eDate.keyCliente === this.state.user.$key) ? eDate.fotoRentador : eDate.fotoCliente }} style={{ width: 60, height: 60, borderRadius: 100 }} /> */}
                                                    {(eDate.messages === undefined || (eDate.messages[eDate.messages.length - 1].status === 0 && eDate.messages[eDate.messages.length - 1].own !== this.state.user.$key)) ?
                                                        <View style={{ width: 14, elevation: 14, height: 14, borderRadius: 50, backgroundColor: '#3483fa', position: 'absolute', left: 5, top: 5 }} />
                                                        : null
                                                    }
                                                </View>
                                                <View style={{ flex: 0.7, paddingLeft: 15 }}>
                                                    <Text style={{ fontFamily: 'font2', fontSize: 15 }}>Reservaste {this.getProductInfoFromListLocaly(eDate.keyProduct).name} - <Text style={{ color: eDate.status === 3 ? 'green' : '#ff5d5a', fontFamily: 'font1', marginLeft: 5 }}>{this.getStatusReservation(eDate.status)}</Text></Text>
                                                    <Text style={{ fontFamily: 'font1', fontSize: 12, color: '#6A6A6A' }}>
                                                        {this.getTextToShowDateReservation(eDate.estadia)}
                                                    </Text>

                                                </View>
                                                <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                                    <AntDesign name="right" size={24} color="black" />

                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            }


                        </View>
                        : null}
                </ScrollView>
                {/* <NavbarComponent props={this.props} data={'action'} /> */}
                <View style={{ width: width + 30, height: 50, position: 'absolute', top: 0, left: 0, flexDirection: 'row', elevation: 10, backgroundColor: 'white' }}>
                    <TouchableOpacity onPress={() => { this.setState({ activeTab: 1 }) }} style={{ flex: 0.5, elevation: 11, justifyContent: "center", alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'font1', color: this.state.activeTab === 1 ? '#3483fa' : '#696969' }}>Consultas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { this.setState({ activeTab: 2 }) }} style={{ flex: 0.5, elevation: 11, justifyContent: "center", alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'font1', color: this.state.activeTab === 2 ? '#3483fa' : '#696969' }}>Reservaciones</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        height: 50,
        width: width,
        padding: 15,
        fontSize: width < 370 ? 10 : 14,
        backgroundColor: '#eee',
        borderRadius: 5,
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