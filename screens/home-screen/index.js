import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar, AsyncStorage, TouchableHighlight, BackHandler } from 'react-native';

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
import * as Calendar from 'expo-calendar';
import Receiver from '../receiverNotification';
import ActionScreen from '../actions-screen';
import MyAccountScreen from '../my-accoutn-screen';
import {
    MaterialIcons, MaterialCommunityIcons, AntDesign
} from '@expo/vector-icons';

var width = Dimensions.get('window').width - 30; //full width

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

export default class HomeScreen extends Component<any> {

    state = {
        listProducts: null,
        input: null,
        tabActive: 1,
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
        await Calendar.requestPermissionsAsync();
        await Permissions.askAsync(Permissions.CAMERA_ROLL);

        await this.getListProduct();
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }
        BackHandler.addEventListener('hardwareBackPress', function () {
            // this.onMainScreen and this.goBack are just examples, you need to use your own implementation here
            // Typically you would use the navigator here to go to the last state.
            return true;

        });
        // @ts-ignore
        Geocoder.init("AIzaSyDA0NuvPpBCOw5WIOiZ4VS64Od1LocV0XA", { language: 'es' });// use a valid API key
    }

    goToList = async () => {


        let location = await Location.getCurrentPositionAsync({});

        // @ts-ignore
        Geocoder.from(location.coords.latitude, location.coords.longitude)
            .then(async (json) => {
                let barrio = null;
                json.results.map(item => {
                    item.address_components.map(data => {
                        barriosPosibles.map(mes => {

                            if (mes.toUpperCase().match(data.long_name.toUpperCase())) {
                                console.log("se encontro");
                                barrio = mes;
                            }
                        });
                    });
                });
                await AsyncStorage.setItem('Ubication', barrio).then(e => {
                    this.props.navigation.navigate('List');
                });
            })
            .catch(error => console.warn(error));
    }

    goToListFromHomeInput = async (e) => {
        this.setState({ input: '' });
        await AsyncStorage.setItem('Ubication', e.nativeEvent.text).then(ex => {
            this.props.navigation.navigate('List');
        });
    };


    async getListProduct() {
        await getProducts().then(data => {
            this.setState({ listProducts: data });
            AsyncStorage.setItem("Product", JSON.stringify(data));
        });
    }


    layoutOfHomeScreen = () => {
        return (
            <ScrollView>
                <View style={styles.containerData}>
                    
                    <View style={{ marginTop: 15, marginLeft: 30, marginRight: 30 }}>
                        <Text style={{ fontSize: width < 370 ? 24 : 28, fontFamily: 'font2', textAlign: 'center' }}>Encontrá el alquiler</Text>
                        <Text style={{ fontSize: width < 370 ? 24 : 28, fontFamily: 'font2', textAlign: 'center' }}> de tus sueños</Text>
                    </View>
                    <View style={styles.buscadorGroup}>

                        <TextInput style={styles.inputBuscador} value={this.state.input} onChangeText={(e) => this.setState({ input: e })}
                            keyboardType='web-search' onSubmitEditing={(e) => { this.goToListFromHomeInput(e) }}
                            placeholderTextColor="#000000" placeholder="¿En qué barrio estas buscando alojarte?" />
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 0.5 }}>
                        <TouchableOpacity style={styles.btnGuardados} onPress={() => { this.props.navigation.navigate('Favs') }}>
                       
                            {/* <Image source={require('../../assets/icons/heart.png')}
                                style={{ width: 15, height: 15, top: 25 - 7.5, marginRight: 8, position: 'absolute', left: width < 370 ? 20 : 35 }} /> */}

                            <View style={styles.btnIcons}>

                                <MaterialIcons name="favorite-border" size={18} color="white" />

                                <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1, marginLeft: 8, fontSize: width < 370 ? 11 : 14 }}>GUARDADOS</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 0.5 }}>
                        <TouchableOpacity style={styles.btnMapa} onPress={() => this.props.navigation.navigate('Maps')}>
                            <View style={styles.btnIcons}>

                                <MaterialCommunityIcons name="google-maps" size={24} color='#ff5d5a' />

                                <Text style={{ color: '#ff5d5a', fontFamily: 'font2', position: 'relative', top: 1, marginLeft: 8, fontSize: width < 370 ? 11 : 14 }} >BUSCAR EN EL MAPA</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ paddingBottom: 95 }}>
                    <View style={{ marginLeft: 15, marginTop: 20, }}>
                        <View style={{
                            height: 60, width: width, justifyContent: 'center', alignItems: 'flex-start',
                            backgroundColor: '#ff322e91',borderWidth:1.7,borderColor:'#ff5d5a', borderRadius: 25,
                        }}>

                            <View >
                                <View style={{ position: 'absolute',left:18,bottom:-2 }}>
                                    <AntDesign name="exclamationcircle" size={24} color='white' />
                                </View>
                                <Text style={{ color: 'white',marginLeft:55,position:'relative',top:2, fontFamily: 'font3' }}>
                                    En 7 días finaliza tu estadía
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <MyCarousel />
                    </View>

                    <View style={styles.titleSectionContent}>
                        <Text style={styles.titleSection}>Alquileres en tu zona</Text>
                        <Text style={styles.descriptionSection}>Estos son algunos de los alquileres que están cerca de tu ubicación.</Text>
                    </View>


                    <View style={{ flex: 1, flexDirection: 'row', marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                        <View style={{ flex: 0.5, marginRight: 15, }}>


                            <CardPropiedadHome
                                images={this.state.listProducts[0].images}
                                title={this.state.listProducts[0].name}
                                price={this.state.listProducts[0].price}
                                navigation={this.props.navigation}
                                product={this.state.listProducts[0]} />


                        </View>
                        <View style={{ flex: 0.5 }}>

                            <CardPropiedadHome
                                images={this.state.listProducts[1].images}
                                title={this.state.listProducts[1].name}
                                price={this.state.listProducts[1].price}
                                navigation={this.props.navigation}
                                product={this.state.listProducts[1]} />

                        </View>
                    </View>

                    <View style={{ flex: 1, flexDirection: 'row', marginLeft: 15, marginRight: 15, marginTop: 20 }}>
                        <View style={{ flex: 0.5, marginRight: 15, }}>

                            <CardPropiedadHome
                                images={this.state.listProducts[2].images}
                                title={this.state.listProducts[2].name}
                                price={this.state.listProducts[2].price}
                                navigation={this.props.navigation}
                                product={this.state.listProducts[2]} />
                        </View>
                        <View style={{ flex: 0.5 }}>

                            <CardPropiedadHome
                                images={this.state.listProducts[3].images}
                                title={this.state.listProducts[3].name}
                                price={this.state.listProducts[3].price}
                                navigation={this.props.navigation}
                                product={this.state.listProducts[3]} />

                        </View>
                    </View>


                    <View style={{ paddingBottom: 45 }}>
                        <TouchableOpacity style={styles.btnVerMas} onPress={() => this.goToList()}>
                            <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1 }}>VER MÁS ALQUILERES EN MI ZONA</Text>
                        </TouchableOpacity>
                    </View>

                    <ImageBackground source={require('../../assets/bg-example.png')} style={{ width: width + 30, minHeight: 250, justifyContent: 'center' }}>
                        <View style={{ marginTop: 5, paddingLeft: 15, paddingRight: 30 }}>
                            <Text style={{
                                fontFamily: 'font2',
                                fontSize: 28, textAlign: 'center'
                            }}>¿Tenés una propiedad?</Text>
                            <Text style={{
                                fontFamily: 'font1',
                                fontSize: 14, textAlign: 'center'
                            }}>Alquilá tu propiedad con Rentify y generá una ganancia mensual de hasta $36.000 / Mes</Text>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.btnOutline} onPress={() => this.props.navigation.navigate('AddProducto')}>
                                <Text style={{ color: '#ff5d5a', fontFamily: 'font2', position: 'relative', top: 1 }}>PUBLICAR MI PROPIEDAD</Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>

                </View>
            </ScrollView>
        );
    }

    lookScreenActive = () => {
        switch (this.state.tabActive) {
            case 1:
                return this.layoutOfHomeScreen();
                break;
            case 2:
                return <ActionScreen route={this.props.navigation} />
                break;
            case 3:
                return <MyAccountScreen route={this.props.navigation} />
                break;
        }
    };

    changeNavigation = (data) => {
        this.setState({ tabActive: data });
    }

    render() {
        if (this.state.listProducts === null) {
            return (<Spinner
                visible={(this.state.listProducts === null) ? true : false}
                textContent={''} />)
        }

        return (
            <View style={{ backgroundColor: 'white', position: 'relative' }}>

                {this.lookScreenActive()}

                <NavbarComponent props={this.props} data={'home'} tab={this.state.tabActive} callback={this.changeNavigation} />
                <Receiver />

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
        fontSize: width < 370 ? 12 : 14,
        textAlign: 'center',
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
        marginTop: 45,
        width: width,
        marginLeft: 15,
    }
});