import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView } from 'react-native';

import { LogOut } from '../../utilities/FirebaseModule';

import CardLocal from '../../components/Cards/cardLocal';
import CardOfertasPuntos from '../../components/Cards/cardOfertaPuntos';
import CardInvitarAmigo from '../../components/Cards/cardInvitarAmigo';
import CardProductos from '../../components/Cards/cardProductos';




export default class HomeScreen extends Component {



    logout() {
        LogOut(this.props.navigation);
    }



    render() {
        return (
            <View style={styles.bg}>
                <ScrollView>
                    <ImageBackground source={require('../../assets/bg-login.jpg')} style={styles.logo}>

                    </ImageBackground>
                    <View style={styles.container}>

                        <View style={styles.cardlocal}>
                            <CardLocal />
                        </View>
                        <View style={styles.contenedor}>

                            <View style={styles.row}>
                                <View style={styles.col6}>
                                    <CardOfertasPuntos url={this.props} btnAction='Canjear puntos' />
                                </View>
                                <View style={styles.col6}>
                                    <CardOfertasPuntos url={this.props} btnAction='Canjear ofertas' />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col12}>

                                    <CardInvitarAmigo />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.col12}>

                                    <CardProductos />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity style={styles.btnLogout} onPress={() => this.logout()}>
                    <Text style={styles.textButton}>Cerrar sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPay} onPress={() => this.props.navigation.navigate('Payment')}>
                    <Text style={styles.textButton}>Pagar</Text>
                </TouchableOpacity>
            </View>
        );
    }
}


const styles = StyleSheet.create({

    logo: {
        height: 275,
        backgroundColor: "black",
        alignSelf: 'stretch',
        textAlign: 'center',
    },
    cardlocal: {
        position: 'relative',
        top: -50,
        margin: 8
    },
    bg: {
        backgroundColor: "#eee",
        flex: 1
    },
    row: {
        flex: 1,
        flexDirection: 'row'
    },
    col6: {
        flex: 0.5,
        margin: 8
    },
    col12: {
        flex: 1,
        margin: 8
    },
    contenedor: {
        position: 'relative',
        top: -25
    },
    btnLogout: {
        backgroundColor: '#e61010',
        height: 40,
        width: null,
        position: 'absolute',
        top:50,
        left:0,
        flex: 1,
        elevation:50,
        borderTopRightRadius:12,
        borderBottomRightRadius:12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPay: {
        position: 'absolute',
        bottom: 15,
        elevation: 15,
        width: 70,
        height: 70,
        backgroundColor: '#3C7FFF',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100
    },
    textButton: {
        color: 'white',
        fontSize: 16
    }
});