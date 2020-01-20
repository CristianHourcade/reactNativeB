import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar, AsyncStorage, TouchableHighlight, TouchableHighlightBase, TouchableNativeFeedback, BackHandler } from 'react-native';

import { LogOut } from '../../utilities/FirebaseModule';


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
import { getProducts } from '../../utilities/ProductsModule';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Geocoder from 'react-native-geocoding';
import Receiver from '../receiverNotification';

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


export default class ListFavsScreen extends Component<any> {

    state = {
        listProducts: null,
        location: null,
        marker: null,
        listFilters: null,
        ubication: null,
    }


    lookProduct = async (x) => {
        try {
            await AsyncStorage.setItem('Selected', JSON.stringify(x)).then(e => {
                this.props.navigation.navigate('InfoProduct');
            });
        } catch{
            console.warn;
        }
    }


    async componentDidMount() {
        await this.getListProduct();
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack();
            return true;
        });
    }

    async getListProduct() {
        const aux = await AsyncStorage.getItem("Product")
        const user = await AsyncStorage.getItem('Usuario');

        let userData = JSON.parse(user);
        let list = JSON.parse(aux);

        const dataToShow = [];
        userData.favs.map(userElement => {
            list.map(element => {
                if (userElement === element.$key) {
                    dataToShow.push(element);
                }
            });
        });

        this.setState({ listProducts: dataToShow });


    }


    render() {
        if (this.state.listProducts === null) {
            return (<Spinner
                visible={(this.state.listProducts === null) ? true : false}
                textContent={''} />)
        }

        return (
            <View style={{ backgroundColor: 'white', position: 'relative' }}>
<Receiver />
                <View style={styles.containerData}>
                    <TextInput style={styles.inputBuscador} defaultValue={this.state.ubication} placeholderTextColor="#000000" keyboardType='web-search' placeholder="Tus propiedades guardadas" />
                    <TouchableOpacity style={{
                        height: 50, width: 80, backgroundColor: '#ff5d5a',
                        position: 'absolute', top: 0, right: 0,
                        justifyContent: 'center', alignItems: 'center', elevation: 9
                    }}>
                        <Text style={{ fontFamily: 'font2', color: 'white' }}>FILTROS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        height: 50, width: 50,
                        position: 'absolute', top: 0, left: 0,
                        justifyContent: 'center', alignItems: 'center', elevation: 9

                    }}
                        onPress={() => { this.props.navigation.navigate('Home'); AsyncStorage.removeItem('Ubication') }}>
                        <Image source={require('../../assets/arrow_b.png')} style={{ width: 25, height: 25, position: 'relative', top: 1, }} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ height: he }}>
                    <View style={{ paddingBottom: 95 }}>
                        <View style={{ flex: 1, flexWrap: 'wrap', flexDirection: 'row', marginLeft: 0, marginRight: 0, marginTop: 5, justifyContent: 'center' }}>
                            {this.state.listProducts.map(element => {
                                return (<View style={{ marginTop: 30 }}>
                                    <CardPropiedadList
                                        navigation={this.props.navigation}
                                        product={element}
                                        replaceIt={true}
                                        images={element.images}
                                        title={element.name}
                                        price={element.price} />
                                </View>)
                            })}
                        </View>



                    </View>
                </ScrollView>

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
        marginLeft: 15,
        marginRight: 15,
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
        fontSize: 14
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
        // marginTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
        flexDirection: 'column',
    },
    logoCont: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buscadorGroup: {
        // height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textLogo: {
        fontSize: 28,
        fontFamily: 'font2'
    },
    inputBuscador: {
        height: 50,
        width: width + 30,
        padding: 15,
        paddingRight: 80,
        backgroundColor: 'white',
        shadowColor: "#000",
        textAlign: 'center',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,

        elevation: 8,
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
        marginTop: 45,
        width: width,
        marginLeft: 15,
    }
});