import React, { Component } from 'react';
import { StyleSheet, Platform, Text, View, TextInput, Image, ImageBackground, TouchableOpacity, StatusBar, Alert, AsyncStorage, ScrollView, BackHandler } from 'react-native';
import NavbarComponent from '../../navigation/Navbar';
import Constants from 'expo-constants';
import { Dimensions } from "react-native";
import { NavigationActions } from 'react-navigation';
import Receiver from '../receiverNotification';
var width = Dimensions.get('window').width - 30; //full width
var height = Dimensions.get('window').height  //full width

export default class MyAccountScreen extends Component<any> {

    state = {
        user: null
    }
    async componentDidMount() {
        const result = await AsyncStorage.getItem('Usuario');
        this.setState({ user: JSON.parse(result) })
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack();
            return true;
        });
    }

    async componentDidUpdate() {
        const result = await AsyncStorage.getItem('Usuario');
        this.setState({ user: JSON.parse(result) })
        if (await AsyncStorage.getItem('Status') !== null) {
            AsyncStorage.removeItem('Status').then(async (e) => {
                alert('Se edito tu perfil con exito');
            });
        }
    }


    render() {
        if (this.state.user === null) {
            return null;
        }
        return (
            <View>
                <Receiver />
                <ScrollView>
                    <View style={styles.containerData}>
                        <View style={{ marginTop: 45, marginLeft: 30, marginRight: 30, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={{ uri: this.state.user.foto }} style={{ height: 135, width: 135, borderRadius: 8 }} />
                        </View>
                        <View>
                            {(this.state.user !== null) ?
                                <Text style={{ textAlign: 'center', fontFamily: 'font2', fontSize: 20, marginTop: 15, marginBottom: 15 }}>{this.state.user.name}</Text>
                                : null}

                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', padding: 20, backgroundColor: ' rgb(247, 247, 247)' }}>
                            <View style={{ flex: 0.4 }}>
                                <Text style={{ textAlign: 'left' }}>Mi billetera:</Text>
                            </View>
                            <View style={{ flex: 0.6 }}>
                                <Text style={{ textAlign: 'right' }}>${this.state.user.billetera}</Text>
                            </View>
                        </View>
                        {/* <View style={styles.buscadorGroup}>
                            <Image source={require('../../assets/lupa.png')} style={styles.searchIcon} />
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" placeholder="¿Dondé estás buscando alojarte?" />
                        </View> */}
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 0.5 }}>
                            <TouchableOpacity style={styles.btnGuardados}>
                                <View style={styles.btnIcons}>
                                    {/* <Image source={require('../../assets/icons/heart.png')} */}
                                    {/* style={{ width: 15, height: 15, marginRight: 8, position: 'relative', top: 0.5 }} /> */}
                                    <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1 }}>INGRESAR</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 0.5 }}>
                            <TouchableOpacity style={styles.btnMapa} onPress={() => this.props.navigation.navigate('Maps')}>
                                <View style={styles.btnIcons}>
                                    {/* <Image source={require('../../assets/icons/placeholder.png')} style={{ width: 15, height: 15, marginRight: 8 }} /> */}
                                    <Text style={{ color: '#ff5d5a', fontFamily: 'font2', position: 'relative', top: 1 }} >RETIRAR</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ paddingBottom: 95 }}>

                        <View style={styles.titleSectionContent}>
                            <Text style={styles.titleSection}>¡Administrá tu Rentify!</Text>
                            <Text style={styles.descriptionSection}>Administrá toda tu información dentro de Rentify</Text>
                        </View>


                        <View style={{ marginTop: 30 }}>
                            <TouchableOpacity style={styles.btnVerMas} onPress={() => { this.props.navigation.navigate("Profile") }}>
                                <Text style={{ color: '#131313', fontFamily: 'font3', position: 'relative', top: 1 }}>COMPLETAR MI PERFIL</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 0 }}>
                            <TouchableOpacity style={styles.btnVerMas} onPress={() => { this.props.navigation.navigate('History') }}>
                                <Text style={{ color: '#131313', fontFamily: 'font3', position: 'relative', top: 1 }}>MI HISTORIAL</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 0 }}>
                            <TouchableOpacity style={styles.btnVerMas} onPress={() => { alert("Estamos trabajando en tu reputación.") }}>
                                <Text style={{ color: '#131313', fontFamily: 'font3', position: 'relative', top: 1 }}>MI REPUTACIÓN</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 0 }}>
                            <TouchableOpacity style={styles.btnVerMas} onPress={() => { this.props.navigation.navigate('MyProps') }}>
                                <Text style={{ color: '#131313', fontFamily: 'font3', position: 'relative', top: 1 }}>MIS PROPIEDADES</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 60 }}>
                            <TouchableOpacity style={styles.btnGuardados} onPress={() => { AsyncStorage.clear().then(e => { this.props.navigation.replace('Login') }) }}>
                                <Text style={{ color: 'white', fontFamily: 'font3', position: 'relative', top: 1 }}>CERRAR SESIÓN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <NavbarComponent props={this.props} data={'account'} />

            </View>
        )
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
        textAlign: 'center',
        fontSize: 24
    },
    btnVerMas: {
        borderColor: '#ff5d5a',
        color: '#ff5d5a',
        borderBottomWidth: 2,
        marginLeft: 15,
        marginRight: 15,
        height: 50,
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',
        paddingLeft: 10,
        alignItems: 'flex-start',
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
        fontSize: 14,
        textAlign: 'center'
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