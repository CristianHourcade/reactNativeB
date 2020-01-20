import React, { Component } from 'react';
import { StyleSheet, Image, StatusBar, View, Platform, Text, Button, TouchableOpacity, CameraRoll, ScrollView, TextInput, Picker, FlatList, BackHandler, AsyncStorage } from 'react-native';
import { Dimensions } from 'react-native';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import PhotoComponent from './PhotoComponent';
import Spinner from 'react-native-loading-spinner-overlay';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { CheckBox } from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import { Product } from '../../models/Product';
import { addProduct } from '../../utilities/ProductsModule';
import Receiver from '../receiverNotification';


var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;


export default class AddRentScreen extends Component<any> {

    state = {
        photos: null,
        user:null,
        images: [],
        saveTemp: [],   //add to product
        ubication: null,   //add to product
        ubicationGPS: null,//add to product
        mt2: null,//add to product
        tipoPropiedad: null, //add to product
        piso: null, //add to product
        // checkin,checkout, //add to product
        scrollRef: null,
        toTop: false,
        plan: 0, //add to product,
        precio: '0',
        descripcion: '',
        title: null,
        prestaciones: [ // add to product
            { name: 'Wifi', check: false },
            { name: 'TV', check: false },
            { name: 'Aire Acondicionado', check: false },
            { name: 'Estrenar', check: false },
            { name: 'Estacionamiento', check: false },
            { name: 'Ascensor', check: false },
            { name: 'Lavadero', check: false },
            { name: 'Secadora', check: false },
            { name: 'Calefacción', check: false },
            { name: 'Patio', check: false },
            { name: 'Balcón', check: false },
            { name: 'Terraza', check: false },
            { name: 'Lavavajillas', check: false },
            { name: 'Vista exterior', check: false },
            { name: 'Pileta', check: false },
            { name: 'Amueblado', check: false },
            { name: 'Encargado', check: false },
        ],
        normas: [
            { name: 'No se puede fumar', check: false },
            { name: 'No se permiten mascotas', check: false },
            { name: 'No se permite hacer fiestas', check: false },
        ],
        loading: false,
        imageToSee: 40,
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        imagenList: [],
        auxList: [],
        image: null,
        step: 1,
        isOpenMap: false,
        barrio:null,
        isOpenPrestaciones: false,
        isOpenNormas: false,
        location: null,
        errorMessage: null,
        marker: null,
        region: null
    };

    constructor(props) {
        super(props);
    }

    async _pickImage() {
        const images = this.state.images;
        const saves = this.state.saveTemp;

        await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        }).then(resulta => {
            if (!resulta.cancelled) {
                images.push(resulta);
                saves.push(resulta);
                // @ts-ignore
                this.setState({ images: images, saveTemp: saves, image: resulta.uri });
            }
        });
    };


    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    }

    async _renderPhotos(photos) {
        let images = [];

        if (Platform.OS !== 'ios') {
            for (let { node: photo } of photos.edges) {

                if (photo.type === 'image/jpeg' || photo.type === 'image/jpg' || photo.type === 'image/png') {
                    images.push(photo.image);
                }
            }
        } else {
            for (let { node: photo } of photos.edges) {

                if (photo.type === 'image') {
                    images.push(photo.image);
                }
            }
        }
        this.setState({ images: images });
    }

    toggleMap() {
        this.setState({ isOpenMap: !this.state.isOpenMap });
    }
    onRegionChange = (region) => {
        this.setState({ region });
    }

    getAdressUbication = () => {
        // @ts-ignore
        Geocoder.from(this.state.region.latitude, this.state.region.longitude)
            .then(json => {
                var addressComponent = json.results[0].address_components[0];
                alert("Tu dirección aproximada es: " + json.results[0].formatted_address);
                console.log();

                this.setState({
                    barrio: json.results[3].address_components[0].long_name, ubicationGPS: { latitude: this.state.region.latitude, longitude: this.state.region.longitude }
                });
                this.setState({ ubication: json.results[0].formatted_address, isOpenMap: false });
            })
            .catch(error => console.warn(error));
    }

    showMap = () => {
        if (this.state.isOpenMap) {
            return (
                <View style={styles.container}>

                    <MapView
                        style={styles.mapStyle}
                        region={
                            this.state.region
                        }
                        onRegionChangeComplete={(region) => this.setState({ region })}
                        customMapStyle={generateStyle}
                    />

                    <View style={{
                        position: 'absolute', top: height / 2 - 50, height: 100, width: 100, left: width / 2 - 60, backgroundColor: '#0080ff82', borderRadius: 50, justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Text style={{ position: 'relative', color: 'white', fontFamily: 'font2', padding: 5, textAlign: 'center', alignSelf: 'center' }}>Ubicación de tu propiedad</Text>
                    </View>


                    <TouchableOpacity style={{
                        position: 'absolute', height: 50, bottom: 25, width: width - 30, left: 15, backgroundColor: '#3483fa', justifyContent: 'center',
                        borderRadius: 5,
                        alignItems: 'center',
                    }}
                        onPress={() => this.getAdressUbication()}
                    >
                        <Text style={{ fontFamily: 'font2', color: 'white' }}>Guardar ubicación</Text>
                    </TouchableOpacity>
                    <View style={{ position: 'absolute', left: 5, top: 5, padding: 10, elevation: 9 }}>
                        <TouchableOpacity style={{ backgroundColor: 'white', borderRadius: 50, width: 50, height: 50 }} onPress={() => this.setState({ isOpenMap: !this.state.isOpenMap })}>
                            <Image source={require('../../assets/close.png')} style={{ height: 25, width: 25, position: 'relative', left: 12, top: 12 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    showPrestaciones = () => {
        if (this.state.isOpenPrestaciones) {
            return (
                <View style={styles.container}>
                    <View style={{ height: height, width: width, padding: 15, backgroundColor: 'white' }}>
                        <TouchableOpacity onPress={() => this.setState({ isOpenPrestaciones: false })}>
                            <Image source={require('../../assets/close.png')} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ fontFamily: 'font2', fontSize: 20 }}>Seleccioná las prestaciones de tu propiedad</Text>
                        </View>
                        <ScrollView style={{ height: 500, marginBottom: 75, }}>

                            {this.state.prestaciones.map(element => {
                                return (
                                    <CheckBox
                                        title={element.name}
                                        checked={element.check}
                                        onPress={() => { element.check = !element.check; this.forceUpdate() }}
                                    />
                                )
                            })}
                        </ScrollView>

                        <TouchableOpacity style={{
                            position: 'absolute', height: 50, bottom: 25, width: width - 30, left: 15, backgroundColor: '#3483fa', justifyContent: 'center',
                            borderRadius: 5,
                            alignItems: 'center',
                        }}
                            onPress={() => this.setState({ isOpenPrestaciones: false })}
                        >
                            <Text style={{ fontFamily: 'font2', color: 'white' }}>Guardar Prestaciones</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }


    showNormas = () => {
        if (this.state.isOpenNormas) {
            return (
                <View style={styles.container}>
                    <View style={{ height: height, width: width, padding: 15, backgroundColor: 'white' }}>
                        <TouchableOpacity onPress={() => this.setState({ isOpenNormas: false })}>
                            <Image source={require('../../assets/close.png')} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ fontFamily: 'font2', fontSize: 20 }}>Seleccioná las prestaciones de tu propiedad</Text>
                        </View>
                        <ScrollView style={{ height: 500, marginBottom: 75, }}>

                            {this.state.normas.map(element => {
                                return (
                                    <CheckBox
                                        title={element.name}
                                        checked={element.check}
                                        onPress={() => { element.check = !element.check; this.forceUpdate() }}
                                    />
                                )
                            })}
                        </ScrollView>

                        <TouchableOpacity style={{
                            position: 'absolute', height: 50, bottom: 25, width: width - 30, left: 15, backgroundColor: '#3483fa', justifyContent: 'center',
                            borderRadius: 5,
                            alignItems: 'center',
                        }}
                            onPress={() => this.setState({ isOpenNormas: false })}
                        >
                            <Text style={{ fontFamily: 'font2', color: 'white' }}>Guardar Normas</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    toggleNormas() {
        this.setState({ isOpenNormas: !this.state.isOpenNormas });
    }

    reloadComponent = () => {
        if (this.state.saveTemp[0] !== undefined) {
            this.setState({ image: this.state.saveTemp[0].uri });
        } else {
            this.setState({ image: null });
        }

        this.setState({ saveTemp: this.state.saveTemp, images: this.state.images });
    }

    async componentWillMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
            // @ts-ignore
            Geocoder.init("AIzaSyDA0NuvPpBCOw5WIOiZ4VS64Od1LocV0XA", { language: 'es' }); // use a valid API key
        }
        const userData = await AsyncStorage.getItem('Usuario');
        this.setState({user: JSON.parse(userData)});
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let region = await Location.getCurrentPositionAsync({});
        this.setState({ region: { latitude: region.coords.latitude, longitude: region.coords.longitude, longitudeDelta: 0.01, latitudeDelta: 0.01 } })
    };

    backHandler;
    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (this.state.step !== 1) {
                let aux = this.state.step - 1;
                this.setState({ step: aux });
                return true;
            } else {
                this.props.navigation.navigate('Home');
                return true;
            }

        });
        this.getPermissionAsync();
        this._getPhotosAsync().catch(error => {
            console.error(error);
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    async _getPhotosAsync() {
        let photos
        if (Platform.OS === 'ios') {
            CameraRoll.getPhotos({ first: this.state.imageToSee, assetType: 'All', groupTypes: 'All' }).then(data => {
                this.setState({ data });
                this._renderPhotos(data);
            }).catch((e) => {
                alert(JSON.stringify(e));
            });
        } else {
            CameraRoll.getPhotos({ first: this.state.imageToSee }).then(data => {
                this.setState({ data });
                this._renderPhotos(data);
            }).catch((e) => {
                alert(JSON.stringify(e));
            });
        }
    }

    addMoreImages() {
        this.setState({ photos: this.state.photos.push() })
    }

    changeStep() {
        if (this.state.saveTemp.length > 0) {
            this.setState({ step: this.state.step + 1 });
        }
    }

    countPrestaciones = () => {
        let contador = 0;
        this.state.prestaciones.map(element => {
            if (element.check) {
                contador++;
            }
        });
        return contador;
    }
    countNormas = () => {
        let contador = 0;
        this.state.normas.map(element => {
            if (element.check) {
                contador++;
            }
        });
        return contador;
    }
    calculateStep = () => {
        switch (this.state.step) {
            case 1:
                return (
                    <View style={{ flex: 1, flexDirection: "row", flexWrap: 'wrap' }}>


                        {
                            (this.state.images.length !== 0) ?
                                this.state.images.map((element) => {
                                    return (
                                        <PhotoComponent image={element} saves={this.state.saveTemp} handler={this.reloadComponent} />
                                    )
                                }) :
                                (Platform.OS !== 'ios') ?
                                    <Spinner
                                        visible={true}
                                        textContent={''} />
                                    : null
                        }
                        {
                            (this.state.images.length !== 0) ?

                                <TouchableOpacity
                                    onPress={() => this._pickImage()}
                                    style={styles.btnVerMas}
                                >
                                    <Text style={{ color: 'white', fontFamily: 'font2' }}>VER MÁS FOTOS</Text>
                                </TouchableOpacity>

                                : null
                        }

                    </View>)
            case 2:
                return (
                    <View style={{ marginTop: 15, marginBottom: 40 }}>
                        <View>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center' }}>¡Cargaste las fotos con exito!</Text>
                            <Text style={{ fontFamily: 'font1', fontSize: 18, marginTop: 40 }}>Ahora contanos donde se ubica</Text>
                        </View>
                        <View style={{ marginTop: 15, position: 'relative', }}>
                            <TouchableOpacity style={styles.inputBuscador} onPress={() => this.toggleMap()}>
                                <Text style={{ paddingRight: 25 }}>{this.state.ubication === null ? 'Av. Ejemplo 1234' : this.state.ubication}</Text>
                                <Image source={require('../../assets/gps.png')} style={{ width: 25, height: 25, position: 'absolute', right: 15, top: 13 }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontFamily: 'font1', fontSize: 18 }}>¿Cuantos mt2 tiene tu propiedad?</Text>
                        </View>
                        <View style={{ marginTop: 15, position: 'relative' }}>
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" placeholder="0" keyboardType='phone-pad' value={this.state.mt2} onChangeText={mt2 => this.setState({ mt2: mt2 })} />
                            <Text style={{ position: 'absolute', right: 15, top: 17 }}>mt²</Text>
                        </View>

                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontFamily: 'font1', fontSize: 18 }}>¿Que tipo de propiedad es?</Text>
                        </View>
                        <View style={{ marginTop: 15, position: 'relative' }}>
                            <RNPickerSelect
                                style={styles.inputBuscador}
                                placeholder={{
                                    label: 'Hacemé click para seleccionar el tipo de propiedad',
                                    value: null,
                                    color: '#9EA0A4',
                                }}
                                onValueChange={(value) => this.setState({ tipoPropiedad: value })}
                                items={[
                                    { label: 'Casa', value: 'Casa' },
                                    { label: 'Departamento', value: 'Departamento' },
                                    { label: 'Habitacion', value: 'Habitacion' },
                                    { label: 'PH', value: 'PH' },
                                    { label: 'Quinta', value: 'Quinta' },
                                    { label: 'Hotel', value: 'Hotel' },
                                ]}
                            />
                        </View>

                        
                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontFamily: 'font1', fontSize: 18 }}>¿Que prestaciones tiene tu propiedad?</Text>
                            <TouchableOpacity style={{
                                backgroundColor: 'white',
                                borderWidth: 2,
                                borderColor: '#ff5d5a',
                                height: 50,
                                width: width - 30,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                elevation: 3,
                                marginTop: 10
                            }}
                                onPress={() => this.togglePrestaciones()}>
                                <View style={{
                                    position: 'absolute', justifyContent: 'center',
                                    alignItems: 'center', left: 10, top: 7, height: 30, width: 30, borderRadius: 50, backgroundColor: '#ff5d5a'
                                }}>
                                    <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1 }}>
                                        {this.countPrestaciones()}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: 'font3', fontSize: 16, color: '#ff5d5a', position: 'relative', top: 1 }}>Seleccionar las prestaciones </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontFamily: 'font1', fontSize: 18 }}>¿Cuales son las normas?</Text>
                            <TouchableOpacity style={{
                                backgroundColor: 'white',
                                borderWidth: 2,
                                borderColor: '#3483fa',
                                height: 50,
                                width: width - 30,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                elevation: 3,
                                marginTop: 10
                            }}
                                onPress={() => this.toggleNormas()}>
                                <View style={{
                                    position: 'absolute', justifyContent: 'center',
                                    alignItems: 'center', left: 10, top: 7, height: 30, width: 30, borderRadius: 50, backgroundColor: '#3483fa'
                                }}>
                                    <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1 }}>
                                        {this.countNormas()}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: 'font3', fontSize: 16, color: '#3483fa', position: 'relative', top: 1 }}>Seleccionar las normas </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                );
            case 3:
                return (

                    <View>
                        <View>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 10 }}>¡Ya estás por publicar!</Text>
                            <Text style={{ fontFamily: 'font1', fontSize: 18, marginTop: 10, textAlign: 'center' }}>Falta lo más importante, ¿Cuanto cuesta por día?</Text>
                        </View>
                        <View style={{ marginTop: 15, position: 'relative' }}>
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" placeholder="0" keyboardType='phone-pad' value={this.state.precio} onChangeText={data => this.setState({ precio: data })} />
                            <Text style={{ position: 'absolute', right: 15, top: 17 }}>ARS</Text>
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 10, marginBottom: 10 }}>Ponele un titulo al anuncio</Text>
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" placeholder="Mi departamento iluminoso" keyboardType='default' value={this.state.title} onChangeText={data => this.setState({ title: data })} />
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 10, marginBottom: 10 }}>Describi un poco tu alquiler</Text>

                            <TextInput style={styles.inputBuscador2} placeholderTextColor="#000000" placeholder="Mi departamento iluminoso" multiline={true}
                                numberOfLines={4}
                                keyboardType='default' value={this.state.descripcion} onChangeText={data => this.setState({ descripcion: data })} />
                        </View>

                        <View>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 40 }}>¿Qué exposicion queres?</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'column', marginTop: 20 }}>
                            <TouchableOpacity
                                onPress={() => this.setState({ plan: 0 })}
                                style={{
                                    height: 90, flex: 1, backgroundColor: 'white', borderRadius: 4, shadowColor: "#000",
                                    justifyContent: 'center',
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                    marginRight: 10,
                                    marginLeft: 10,
                                    marginBottom: 10,
                                }}>
                                <View style={{
                                    position: 'absolute', left: 0, top: 0, backgroundColor: (this.state.plan === 0) ? '#3483fa' : '#eee',
                                    width: 20, height: 90, borderTopLeftRadius: 4, borderBottomLeftRadius: 4
                                }} />

                                <View style={{ position: 'relative', left: 30 }}>
                                    <Text style={{ fontFamily: 'font2', fontSize: 20 }} >
                                        Plan Silver
                                    </Text>
                                    <Text style={{ marginTop: 2 }}>
                                        Exposicion normal
                                    </Text>
                                    <Text style={{ marginTop: 5 }}>
                                        13% Comision
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.setState({ plan: 1 })}
                                style={{
                                    height: 90, flex: 1, backgroundColor: 'white', borderRadius: 4, shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    justifyContent: 'center',
                                    elevation: 5,
                                    marginBottom: 20,
                                    marginRight: 10,
                                    marginLeft: 10
                                }}>
                                <View style={{
                                    position: 'absolute', left: 0, top: 0, backgroundColor: (this.state.plan !== 0) ? '#3483fa' : '#eee',
                                    width: 20, height: 90, borderTopLeftRadius: 4, borderBottomLeftRadius: 4
                                }} />

                                <View style={{ position: 'relative', left: 30 }}>
                                    <Text style={{ fontFamily: 'font2', fontSize: 20 }} >
                                        Plan Gold
                                    </Text>
                                    <Text style={{ marginTop: 2 }}>
                                        Exposicion normal
                                   </Text>
                                    <Text style={{ marginTop: 5 }}>
                                        17% Comision
                                    </Text>
                                </View>

                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 20, marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 40 }}>
                                Resultados de tus beneficios
                            </Text>
                            <Text style={{ fontFamily: 'font3', textAlign: 'center', fontSize: 16, color: '#3b3b3b', alignSelf: 'center', marginTop: 5 }}>
                                Utilizá los siguientes calculos para buscar el beneficio que buscas
                            </Text>
                        </View>
                        <View style={{
                        }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text style={{ flex: 0.7, color: '#3483fa', fontSize: 17, fontFamily: 'font3' }}>Precio: </Text>
                                <Text style={{ flex: 0.3, color: '#3483fa', fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${this.state.precio}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text style={{ flex: 0.7, fontSize: 17, fontFamily: 'font3' }}>Comisión del {(this.state.plan === 0) ? '13%' : '17%'}: </Text>
                                <Text style={{ flex: 0.3, fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${Math.round((this.state.plan === 0) ? (Number(this.state.precio) * 13 / 100) : Number(this.state.precio) * 17 / 100)}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text style={{ flex: 0.7, fontSize: 17, fontFamily: 'font3' }}>Gastos de limpieza (Por alquiler): </Text>
                                <Text style={{ flex: 0.3, fontSize: 17, fontFamily: 'font3', justifyContent: 'center', alignItems: 'center', textAlign: 'right' }}>$170</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>

                                <Text style={{ flex: 0.7, color: '#39b54a', fontSize: 17, fontFamily: 'font3' }}>Tu beneficio por día: </Text>
                                <Text style={{ flex: 0.3, color: '#39b54a', fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${Math.round(Number(this.state.precio) - ((this.state.plan === 0) ? Number(this.state.precio) * 13 / 100 : Number(this.state.precio) * 17 / 100))}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>

                                <Text style={{ flex: 0.7, color: '#39b54a', fontSize: 17, fontFamily: 'font3' }}>Tu beneficio aproximado por mes: </Text>
                                <Text style={{ flex: 0.3, color: '#39b54a', fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${Math.round((Number(this.state.precio) - ((this.state.plan === 0) ? Number(this.state.precio) * 13 / 100 : Number(this.state.precio) * 17 / 100)) * 29)}</Text>
                            </View>

                        </View>
                    </View>
                )
                break;
            case 4:
                return (
                    <View style={{ marginTop: 20, marginBottom: 20 }}>
                        <Image source={require('../../assets/icons/checked.png')} style={{ alignSelf: 'center', width: width / 3, height: width / 3 }} />
                        <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 40 }}>
                            ¡Publicaste tu alquiler con exito!
                            </Text>
                        <Text style={{ fontFamily: 'font3', textAlign: 'center', fontSize: 16, color: '#3b3b3b', alignSelf: 'center', marginTop: 5 }}>
                            Tu alquiler ya está disponible para todo el mundo
                            </Text>
                        <View >

                            <TouchableOpacity style={styles.btnGoogle} onPress={() => this.props.navigation.navigate('Home')}>
                                <Text style={{ fontFamily: 'font3', fontSize: 16, color: 'white' }}>VOLVER AL INICIO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    }


    reloadImages() {
        if (this.state.auxList.length !== 0) {
            if (this.state.auxList.length !== this.state.images.length) {
                const cont = 1;
                this.state.images.map(element => {
                    if (cont > this.state.auxList.length) {
                        this.state.auxList.push(<PhotoComponent image={element} saves={this.state.saveTemp} handler={this.reloadComponent} />);
                    }
                })
            }
            return (this.state.auxList);
        }
        if (this.state.images !== null) {
            const aux = []
            this.state.images.map((element) => {
                aux.push(
                    <PhotoComponent image={element} saves={this.state.saveTemp} handler={this.reloadComponent} />
                );
            });
            this.setState({ auxList: aux })
            return aux;
        } else {
            return (
                <Spinner
                    visible={true}
                    textContent={'Cargando'}
                />);
        }
    }

    nextStep = () => {
        if (this.state.step !== 3) {
            this.setState({ step: this.state.step + 1 });
        } else {
            let productToPush: Product;
            productToPush = {
                images: [],
                imagesTemp: this.state.saveTemp,
                name: this.state.title,
                description: this.state.descripcion,
                price: Number(this.state.precio),
                ubicacionGPS: this.state.ubicationGPS,
                ubicacion: this.state.ubication,
                barrio: this.state.barrio,
                type: this.state.tipoPropiedad,
                pisoDp: this.state.piso,
                plan: this.state.plan,
                views: 0,
                prestaciones: this.state.prestaciones,
                normas: this.state.normas,
                sales: 0,
                keyOwner: this.state.user.$key,
                dataReservation:null
            }
            this.setState({ loading: true });
            addProduct(productToPush).then(data => {
                this.setState({ loading: false, step: 4 });
            });
        }

    }
    togglePrestaciones() {
        this.setState({ isOpenPrestaciones: !this.state.isOpenPrestaciones });
    }

    componentDidUpdate() {
        // if (this.state.scrollRef !== null && this.state.toTop === false) {
        //     console.log(this.state.scrollRef);
        //     this.state.scrollRef.scrollTo({x:0,y:0, animated:true})
        // }
    }

    render() {
        let listView;
        let widthProgress;
        let titleText;
        let { image, step } = this.state;
        switch (step) {
            case 1:
                widthProgress = 40;
                titleText = "1. ¡Seleccioná las fotos de tu propiedad!"
                break;
            case 2:
                widthProgress = 140
                titleText = "2. Contanos un poco sobre tu propiedad"

                break;
            case 3:
                widthProgress = 230;
                titleText = "3. Precio y beneficios"
                break;
            case 4:
                widthProgress = 300;
                titleText = "4. ¡Felicitaciones!"
                break;
        }
        return (
            <View style={styles.splash}>
                <Receiver />
                <Spinner
                    visible={this.state.loading}
                    textContent={''} />
                <View style={styles.bar}>
                    <View>
                        <Text style={styles.title}>{titleText}</Text>
                    </View>
                    <View style={{ position: 'relative', marginTop: 15 }}>
                        <View style={styles.barraProgresBg}></View>
                        {(step !== undefined) ?
                            < View style={{
                                width: widthProgress,
                                height: 15,
                                backgroundColor: '#ff5d5a',
                                borderRadius: 50,
                                elevation: 2,
                                position: 'absolute',
                                bottom: 0
                            }} >
                                <LinearGradient
                                    colors={['#ff5d5a', '#f0476d']}
                                    style={{ height: 15, alignItems: 'center', borderRadius: 5 }}
                                    start={[0, 0]}
                                    end={[1, 0]}>
                                </LinearGradient>
                            </ View>
                            :
                            null
                        }
                    </View>
                </View>

                <View style={{}}>

                    {(image && this.state.saveTemp[0] !== undefined && step === 1) ?

                        <Image source={{ uri: image }} style={{
                            width: (step === 1) ? width : width - 60,
                            height: (step === 1) ? width : width - 60,
                            maxHeight: 500,
                            maxWidth: 500,
                            marginLeft: 0,
                            alignSelf: 'center',
                            borderRadius: 3,
                        }} />
                        : null}

                    <View style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 15, flex: 1, flexDirection: 'row' }}>

                        {/* {
                            (step === 1) ? */}
                        <ScrollView
                            ref={ref => listView = ref}
                            onContentSizeChange={() => {
                                listView.scrollTo({ y: 0 })
                            }}
                            style={
                                (step === 1) ?
                                    { width: width, height: height - ((this.state.image || this.state.saveTemp[0] !== undefined) ? (width > 500) ? 680 : (width + 180) : 180) }
                                    : { width: width, height: height - 175 }}
                        >
                            {this.calculateStep()}
                        </ScrollView>
                        {/* :
                                <ScrollView scrollsToTop={true} style={{ width: width, height: height - 200 }}>
                                    {this.calculateStep()}
                                </ScrollView>
                        } */}
                    </View>
                </View>

                {step !== 4 ?
                    <TouchableOpacity style={styles.btnSiguiente} onPress={() => this.nextStep()}>
                        <Text style={{
                            color: 'white', fontSize: 20, fontFamily: 'font3', borderTopLeftRadius: 5,
                            borderTopRightRadius: 5
                        }}
                        >
                            {step === 3 ? '¡Publicar!' : 'Siguiente'}
                        </Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.btnSiguiente} onPress={() => alert("Todavia no funciona")}>
                        <Text style={{
                            color: 'white', fontSize: 20, fontFamily: 'font3', borderTopLeftRadius: 5,
                            borderTopRightRadius: 5
                        }}
                        >
                            ¡Ver mi publicación!
                        </Text>
                    </TouchableOpacity>}

                {this.showMap()}
                {this.showPrestaciones()}
                {this.showNormas()}

            </View >
        );
    }
};

const styles = StyleSheet.create({
    splash: {
        flex: 1,
    },
    btnSiguiente: {
        height: 55,
        width: width,
        position: 'absolute',
        left: 0,
        bottom: 0,
        backgroundColor: '#ff5d5a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnVerMas: {
        height: 55,
        width: width - 30,
        backgroundColor: '#3483fa',
        justifyContent: 'center',
        borderRadius: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: 'font2'
    },
    barraProgres: {
        // width: this.state.step,
        height: 15,
        backgroundColor: '#ff5d5a',
        borderRadius: 50,
        elevation: 2,
        position: 'relative',
        bottom: -15
    },
    row: { flexDirection: 'row' },
    image: { width: 300, height: 300, backgroundColor: 'gray' },
    button: {
        padding: 13,
        margin: 15,
        backgroundColor: '#dddddd',
    },
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        elevation: 20,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        position: 'absolute',
        top: 0,
        left: 0
    },
    btnGoogle: {
        backgroundColor: '#3483fa',
        borderRadius: 50,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 70,
        marginRight: 70,
        height: 45,
        elevation: 2,
        marginTop: 10
    },
    inputBuscador: {
        height: 50,
        width: width - 30,
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    inputBuscador2: {
        minHeight: 50,
        width: width - 30,
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    barraProgresBg: {
        width: 300,
        height: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 50
    },
    card: {
        marginTop: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        width: width - 30,
        height: 120,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.41,
        shadowRadius: 9.11,
        elevation: 7
    },
    bar: {
        backgroundColor: 'white',
        height: 100,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.41,
        shadowRadius: 9.11,
        flexDirection: 'column',
        elevation: 14,
        justifyContent: 'center',
        alignItems: 'center',
    }
});


const generateStyle = [
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
];