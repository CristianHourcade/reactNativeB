import React, { Component } from "react";
import { View, Text, AsyncStorage } from "react-native";
import { Notifications } from "expo";
import { getClientsByKeyWithoutRedirection } from "../../utilities/ClientsModule";
import { Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

var width = Dimensions.get('window').width; //full width

export default class Receiver extends Component<any> {

    constructor(props) {
        super(props)
    }

    state = {
        show: false
    }

    _notificationSubscription;

    componentDidMount() {
        this._notificationSubscription = Notifications.addListener(this._handleNotification);

    }


    _handleNotification = async notification => {
        let x = await AsyncStorage.getItem("Usuario");
        let y = JSON.parse(x);
        getClientsByKeyWithoutRedirection(y.$key);
        this.setState({ show: true });
        setTimeout(() => { this.setState({ show: false }) }, 5000)
    };

    render() {

        return (
            <View style={{ width: width - 60, position: 'absolute', top: 15, left: 30, }}>
                {this.state.show ?
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.navigate('Action')
                        }}
                        style={{ width: width - 60, height: 50, borderRadius: 50, backgroundColor: '#ff5d5ae0', padding: 15, justifyContent: 'center', elevation: 15 }}>
                        <Text style={{ color: 'white', fontFamily: 'font1' }}>
                            ¡Tenés una nueva notificación!
                        </Text>
                    </TouchableOpacity>
                    : null}
            </View>
        )
    }
}