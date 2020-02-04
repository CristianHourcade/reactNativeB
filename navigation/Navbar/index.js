import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar } from 'react-native';

import { LogOut } from '../../utilities/FirebaseModule';

import StylesGlobal from '../../styles/styles';
import Carousel from 'react-native-snap-carousel';

import Constants from 'expo-constants';
import { Dimensions } from "react-native";
import MyCarousel from ' ../../../components/BannersCarrousel';
import CardPropiedadList from '../../components/Cards/cardPropiedadList';
import CardPropiedadHome from '../../components/Cards/cardPropiedadHome';
import Sidebar from '../../components/Sidebar';
import Receiver from '../../screens/receiverNotification';
import { Ionicons, AntDesign } from '@expo/vector-icons';


var width = Dimensions.get('window').width; //full width


export default class NavbarComponent extends Component<any> {

    constructor(props) {
        super(props)
    }
    state = {
        navActive: 1
    }

    render() {
        console.log(this.props);
        return (
            <View style={styles.navbar}>
                <View style={styles.itemNav}>
                    <TouchableOpacity onPress={() => { this.props.callback(1); this.setState({ navActive: 1 }) }}>
                        <AntDesign name="home" size={28} color={this.state.navActive === 1 ? "#ff5d5a" : 'gray'} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 10, marginTop: 4, color:'gray' }}>Inicio</Text>
                </View>
                <View style={styles.itemNav}>

                    <TouchableOpacity onPress={() => { this.props.callback(2); this.setState({ navActive: 2 }) }}>

                        <AntDesign name="message1" size={28} color={this.state.navActive === 2 ? "#ff5d5a" : 'gray'} />
                        {/* <Image source={require('../../assets/icons/chat.png')} style={{ width: 30, height: 30 }} /> */}
                    </TouchableOpacity>
                    <Text style={{ fontSize: 10, marginTop: 4, color: 'gray' }}>Reservas y mensajes</Text>
                </View>
                <View style={styles.itemNav}>
                    <TouchableOpacity onPress={() => { this.props.callback(3); this.setState({ navActive: 3 }) }} >
                        <AntDesign name="user" size={28} color={this.state.navActive === 3 ? "#ff5d5a" : 'gray'} />

                    </TouchableOpacity>
                    <Text style={{ fontSize: 10, marginTop: 4, color:'gray' }}>Mi Perfil</Text>
                </View>

            </View>
        );
    }

}

const styles = StyleSheet.create({
    navbar: {
        flex: 1,
        flexDirection: 'row',
        height: 60,
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -10,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
        width: width,
    },
    itemNav: {
        flex: 0.33,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
