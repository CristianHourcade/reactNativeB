import React, { Component } from "react";
import { View, Text, AsyncStorage } from "react-native";
import { Notifications } from "expo";
import { getClientsByKeyWithoutRedirection } from "../../utilities/ClientsModule";
import { Dimensions } from "react-native";

var width = Dimensions.get('window').width; //full width

export default class Receiver extends Component {

    constructor(props) {
        super(props)
    }

    _notificationSubscription;

    componentDidMount() {
        this._notificationSubscription = Notifications.addListener(this._handleNotification);

    }


    _handleNotification = async notification => {
        alert(JSON.stringify(notification));
        let x = await AsyncStorage.getItem("Usuario");
        let y = JSON.parse(x);
        getClientsByKeyWithoutRedirection(y.$key);
        this.forceUpdate()
    };

    render() {

        return (
            <View style={{width:width-60, height:30, borderRadius:50, position:'absolute', top:15, left:30, backgroundColor:'#ff5d5ab8', padding:15, paddingTop:25, paddingBottom:25}}>
                <Text style={{ color:'white'}}>
                    ¡Tenés una notificación nueva!
                </Text>
            </View>
        )
    }
}