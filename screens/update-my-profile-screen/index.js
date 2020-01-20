import React, { Component } from 'react';
import { StyleSheet, Platform, Text, View, TextInput, Image, ImageBackground, TouchableOpacity, StatusBar, Alert, AsyncStorage, ScrollView, BackHandler } from 'react-native';
import NavbarComponent from '../../navigation/Navbar';
import Constants from 'expo-constants';
import { CheckBox } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';

import { Dimensions } from "react-native";
import Spinner from 'react-native-loading-spinner-overlay';
import { updateClient } from '../../utilities/ClientsModule';
import Receiver from '../receiverNotification';

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height  //full width

export default class UpdateMyProfileScreen extends Component<any> {

    state = {
        user: null,
        nacionalidad: null,
        biografia: null,
        sexo: null,
        edad: null,
        estudio: null,
        image: null,
        paises: null,
        loading: false
    }

    constructor(props) {
        super(props);
    }

    updateClientData = async () => {
        this.setState({ loading: true });
        if (this.state.image !== undefined && this.state.image !== null) {
            await updateClient(this.state.user, this.state.image, true).then(e => {
                AsyncStorage.setItem('Status', 'true').then(e => {
                    this.props.navigation.replace('Account');
                });
            })
        } else {
            await updateClient(this.state.user, this.state.image, true);
            AsyncStorage.setItem('Status', 'true').then(e => {
                this.props.navigation.replace('Account')
            });
        }
    }


    async _pickImage() {
        await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        }).then(result => {
            if (!result.cancelled) {
                this.setState({ image: result });
                this.forceUpdate();
            }
        });
    };


    async componentDidMount() {
        const result = await AsyncStorage.getItem('Usuario');
        this.setState({ user: JSON.parse(result), image: JSON.parse(result).foto })

        const paises = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda",
            "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
            "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
            "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
            "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic",
            "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
            "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
            "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
            "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong",
            "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
            "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
            "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar",
            "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
            "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
            "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru",
            "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome",
            "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
            "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden",
            "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago",
            "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
            "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"]
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.goBack();
            return true;
        });
        var site_value = Object.keys(paises).map(function (key) {
            var output = {};
            output['label'] = paises[key];
            output['value'] = paises[key];
            return output;
        });
        this.setState({ paises: site_value });
    }


    render() {
        if (this.state.user == null) {
            return null;
        }

        return (
            <View>
                <Receiver />
                {this.state.loading ?
                    <Spinner
                        visible={(this.state.loading) ? true : false}
                        textContent={''} />
                    : null}
                <ScrollView>

                    <View style={styles.containerData}>
                        <View style={{ marginTop: 30, marginLeft: 30, marginRight: 30 }}>
                            <Text style={{ fontSize: 28, fontFamily: 'font2', textAlign: 'center' }}>Completá tu perfil</Text>
                        </View>
                        <View style={{ marginTop: 45, marginLeft: 30, marginRight: 30, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => this._pickImage()}>
                                <Image source={{ uri: (this.state.image.uri !== undefined) ? this.state.image.uri : this.state.image }} style={{ height: 135, width: 135, borderRadius: 8 }} />
                            </TouchableOpacity>
                        </View>
                        <View>
                            {(this.state.user !== null) ?
                                <Text style={{ textAlign: 'center', fontFamily: 'font2', fontSize: 20, marginTop: 15, marginBottom: 15 }}>{this.state.user.name}</Text>
                                : null}
                        </View>
                        <TextInput style={styles.inputBuscador2} placeholderTextColor="#000000" placeholder="¡Describite en unas pocas palabras!" multiline={true}
                            numberOfLines={4}
                            value={this.state.user.biografia}
                            keyboardType='default' onChangeText={data => { this.state.user.biografia = data; this.forceUpdate() }} />
                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontSize: 24, fontFamily: 'font2', }}>¿De que sexo sos?</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <CheckBox
                                containerStyle={{ flex: 0.33, marginTop: 10 }}
                                title='Hombre'
                                checked={(this.state.user.sexo === 1) ? true : false}
                                onPress={() => { this.state.user.sexo = 1; this.forceUpdate() }}
                            />
                            <CheckBox
                                containerStyle={{ flex: 0.33, marginTop: 10 }}
                                title='Mujer'
                                checked={(this.state.user.sexo === 2) ? true : false}
                                onPress={() => { this.state.user.sexo = 2; this.forceUpdate() }}
                            />
                            <CheckBox
                                containerStyle={{ flex: 0.33, marginTop: 10 }}
                                title='Otro'
                                checked={(this.state.user.sexo === 3) ? true : false}
                                onPress={() => { this.state.user.sexo = 3; this.forceUpdate() }}
                            />
                        </View>
                        <View style={{ marginTop: 40, marginBottom: 15 }}>
                            <Text style={{ fontSize: 24, fontFamily: 'font2', }}>¿Cual es tu nacionalidad?</Text>
                        </View>

                        <View style={{ marginLeft: 5 }}>
                            {this.state.paises !== null ?
                                <RNPickerSelect
                                    style={{ fontSize: 20, padding: 30 }}
                                    placeholder={{
                                        label: 'Haceme click y seleccioná tu nacionalidad',
                                        value: null,
                                        color: 'black',
                                    }}
                                    onValueChange={(value) => { this.state.user.nacionalidad = value; this.forceUpdate() }}
                                    items={this.state.paises}
                                    value={this.state.user.nacionalidad}
                                />
                                : null}
                        </View>

                        <View style={{ marginTop: 40, marginBottom: 15 }}>
                            <Text style={{ fontSize: 24, fontFamily: 'font2', }}>¿Cuantos años tenes?</Text>
                        </View>

                        <View>
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" placeholder="Escribí acá tu edad"
                                keyboardType='numeric' value={this.state.user.edad} onChangeText={data => { this.state.user.edad = data; this.forceUpdate() }} />
                        </View>
                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontSize: 24, fontFamily: 'font2', }}>¿A que te dedicas?</Text>
                        </View>
                        <CheckBox
                            containerStyle={{ flex: 1 }}
                            title='Estudio'
                            checked={(this.state.user.estudio === 1) ? true : false}
                            onPress={() => { this.state.user.estudio = 1; this.forceUpdate() }}
                        />
                        <CheckBox
                            containerStyle={{ flex: 1 }}
                            title='Trabajo'
                            checked={(this.state.user.estudio === 2) ? true : false}
                            onPress={() => { this.state.user.estudio = 2; this.forceUpdate() }}
                        />
                        <CheckBox
                            containerStyle={{ flex: 1 }}
                            title='Estudio y trabajo'
                            checked={(this.state.user.estudio === 3) ? true : false}
                            onPress={() => { this.state.user.estudio = 3; this.forceUpdate() }}
                        />
                    </View>
                </ScrollView>
                <TouchableOpacity onPress={() => this.updateClientData()} style={{ position: 'absolute', backgroundColor: '#ff5d5a', bottom: 0, left: 0, width: width, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontFamily: 'font3' }}>Guardar</Text>
                </TouchableOpacity>
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
    inputBuscador2: {
        minHeight: 125,
        width: width - 30,
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 5,
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
        elevation: 3,
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
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 90,
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
        width: width - 30,
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