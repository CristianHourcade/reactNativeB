import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar, AsyncStorage, TouchableHighlight, BackHandler } from 'react-native';

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

var width = Dimensions.get('window').width - 30; //full width
var he = Dimensions.get('window').height; //full width


const barriosPosibles = [
    'Agronomia',
    'Almagro',
    'Balvanera',
    'Barracas',
    'Belgrano',
    'Boedo',
    'Caballito',
    'Chacarita',
    'Coghlan',
    'Colegiales',
    'Constitucion',
    'Flores',
    'Floresta',
    'La Boca',
    'Liniers',
    'Mataderos',
    'Monserrat',
    'Monte Castro',
    'Nuñez',
    'Palermo',
    'Parque Avellaneda',
    'Parque Chacabuco',
    'Parque Chas',
    'Parque Patricios',
    'Paternal',
    'Pompeya',
    'Puerto Madero',
    'Recoleta',
    'Retiro',
    'Saavedra',
    'San Nicolás',
    'San Telmo',
    'Vélez Sárfield',
    'Versalles',
    'Villa Crespo',
    'Villa del parque',
    'Villa Devoto',
    'Villa gral mitre',
    'Villa Lugano',
    'Villa luro',
    'Villa ortuzar',
    'Villa Real',
    'Villa riachuelo',
    'Villa santa rita',
    'Villa soldati',
    'Villa Urquiza'
]

export default class ActionScreen extends Component<any> {

    state = {
        activeTab: 1,
        reservations: [],
        products: []
    }


    getListOfReservations = async () => {
        const user = await AsyncStorage.getItem('Usuario');
        let userData = JSON.parse(user);
        const reservaData = [];
        const productData = [];
        const data = userData.reservas.map(async e => {

            await getReservationsForKey(e).then(eValue => {
                return reservaData.push(eValue);
            });

        });
        await Promise.all(data).then(async e => {
            this.setState({ reservations: reservaData });
            const data = this.state.reservations.map(async e => {
                await getProductsWithKey(e.keyProduct).then(eValueProduct => {
                    return productData.push(eValueProduct);
                })
            });
            await Promise.all(data).then(e => {
                this.setState({ products: productData });
            });
        });
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

    render() {
        if (this.state.products === []) {
            return (
                <View>
                    <Text>Sin datos.</Text>
                </View>
            )
        }
        return (
            <View style={{ backgroundColor: 'white', position: 'relative' }}>

                <ScrollView>

                    {this.state.activeTab === 1 ?

                        <View style={{ paddingBottom: 95, marginTop: 50, minHeight: he }}>

                            <View style={styles.titleSectionContent}>
                                <Text style={styles.titleSection}>Mis Mensajes</Text>
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


                            {this.state.reservations.map(eDate => {

                                return (
                                    <TouchableOpacity>
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
                                            <View style={{ flex: 0.7, paddingLeft: 15 }}>
                                                <Text style={{ fontFamily: 'font2', fontSize: 15 }}>{this.getProductInfoFromListLocaly(eDate.keyProduct).name} - <Text style={{ color: eDate.status === 3 ? 'green' : '#ff5d5a', fontFamily: 'font1', marginLeft: 5 }}>{this.getStatusReservation(eDate.status)}</Text></Text>
                                                <Text style={{ fontFamily: 'font1', fontSize: 12, color: '#6A6A6A' }}>
                                                    {this.getTextToShowDateReservation(eDate.estadia)}
                                                </Text>

                                            </View>
                                            <TouchableOpacity style={{ flex: 0.1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                                <Image source={require('../../assets/arrow_b.png')} style={{ width: 24, height: 24, rotation: 180 }} />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}

                        </View>
                        : null}
                </ScrollView>
                <NavbarComponent props={this.props} data={'action'} />
                <View style={{ width: width + 30, height: 50, position: 'absolute', top: 0, left: 0, flexDirection: 'row', elevation: 10, backgroundColor: 'white' }}>
                    <TouchableOpacity onPress={() => { this.setState({ activeTab: 1 }) }} style={{ flex: 0.5, elevation: 11, justifyContent: "center", alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'font1', color: this.state.activeTab === 1 ? '#3483fa' : '#696969' }}>Messages</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { this.setState({ activeTab: 2 }) }} style={{ flex: 0.5, elevation: 11, justifyContent: "center", alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'font1', color: this.state.activeTab === 2 ? '#3483fa' : '#696969' }}>Reservations</Text>
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