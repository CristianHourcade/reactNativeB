import React, { Component } from 'react';
import { StyleSheet, Platform, Text, TextInput, View, TouchableOpacity, Image, ImageBackground, Button, ScrollView, StatusBar, AsyncStorage, Modal, TouchableHighlight, Alert, BackHandler } from 'react-native';
import { Dimensions } from "react-native";
import { getProductsWithKey, updateProduct } from '../../utilities/ProductsModule';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { CheckBox } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import Receiver from '../receiverNotification';


var width = Dimensions.get('window').width - 30; //full width
var he = Dimensions.get('window').height; //full width

export default class UpdatePropiedadScreen extends Component<any> {
    state = {
        product: null,
        modalVisible: false,
        itemSelected: null,
        isOpenPrestaciones: false,
        isOpenNormas: false,
        loading: false,
        productTemp: [],
    }

    constructor(props) {
        super(props);
    }

    countPrestaciones = () => {
        let contador = 0;
        this.state.product.prestaciones.map(element => {
            if (element.check) {
                contador++;
            }
        });
        return contador;
    }

    countNormas = () => {
        let contador = 0;
        this.state.product.normas.map(element => {
            if (element.check) {
                contador++;
            }
        });
        return contador;
    }
    async _pickImage(add?: boolean) {
        await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        }).then(resulta => {
            if (!resulta.cancelled) {
                if (add) {
                    this.state.product.images.push({ type: resulta.type, uri: resulta.uri, index: this.state.product.images.length });
                    alert('entro aca 1')

                } else {
                    this.state.productTemp.push(this.state.itemSelected.uri);
                    this.state.product.images[this.state.itemSelected.index].type = resulta.type;
                    this.state.product.images[this.state.itemSelected.index].uri = resulta.uri;
                    this.state.product.images[this.state.itemSelected.index].index = this.state.itemSelected.index;
                }
                this.setState({ modalVisible: false });
            }
        });
    };

    remove = async () => {
        this.state.productTemp.push(this.state.itemSelected.uri);
        this.state.product.images.splice(this.state.product.images.findIndex(e => e === this.state.itemSelected), 1);
        this.setState({ modalVisible: false });
        this.forceUpdate();
    }

    async componentDidMount() {

        const data = await AsyncStorage.getItem('Selected');
        let productSearch = JSON.parse(data);

        const data2 = await AsyncStorage.getItem('Usuario');
        this.setState({ user: JSON.parse(data2) });


        getProductsWithKey(productSearch.$key).then(e => {
            let aux = 0;

            let array = [];
            e.images.map((el) => {
                var o = { uri: el, index: aux };
                array.push(o);
                aux++;
            });
            e.images = array;
            this.setState({ product: e });
            // this.state.productTemp = this.state.product;
        });
    }

    editItem = (e) => {
        this.setState({ itemSelected: e, modalVisible: true });
    }

    togglePrestaciones() {
        this.setState({ isOpenPrestaciones: !this.state.isOpenPrestaciones });
    }
    toggleNormas() {
        this.setState({ isOpenNormas: !this.state.isOpenNormas });
    }

    showPrestaciones = () => {
        if (this.state.isOpenPrestaciones) {
            return (
                <View style={styles.container}>
                    <View style={{ height: he, width: width + 30, padding: 15, backgroundColor: 'white' }}>
                        <TouchableOpacity onPress={() => this.setState({ isOpenPrestaciones: false })}>
                            <Image source={require('../../assets/close.png')} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ fontFamily: 'font2', fontSize: 20 }}>Seleccioná las prestaciones de tu propiedad</Text>
                        </View>
                        <ScrollView style={{ height: 500, marginBottom: 75, }}>

                            {this.state.product.prestaciones.map(element => {
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
                            position: 'absolute', height: 50, bottom: 25, width: width, left: 15, backgroundColor: '#3483fa', justifyContent: 'center',
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
                    <View style={{ height: he, width: width + 30, padding: 15, backgroundColor: 'white' }}>
                        <TouchableOpacity onPress={() => this.setState({ isOpenNormas: false })}>
                            <Image source={require('../../assets/close.png')} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ fontFamily: 'font2', fontSize: 20 }}>Seleccioná las prestaciones de tu propiedad</Text>
                        </View>
                        <ScrollView style={{ height: 500, marginBottom: 75, }}>

                            {this.state.product.normas.map(element => {
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
                            position: 'absolute', height: 50, bottom: 25, width: width, left: 15, backgroundColor: '#3483fa', justifyContent: 'center',
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

    saveProduct = () => {
        this.setState({ loading: true });
        updateProduct(this.state.product, this.state.productTemp).then(e => {
            AsyncStorage.setItem('Upload', 'true').then(e => {
                this.props.navigation.replace('MyProps');
            })
        })
    };

    render() {
        if (this.state.product === null) {
            return (<Spinner
                visible={(this.state.product === null) ? true : false}
                textContent={''} />)
        }
        return (
            <View >
                <Receiver />
                {this.state.loading ?
                    <Spinner
                        visible={(this.state.loading)}
                        textContent={''} />
                    : null
                }
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert('Modal has been closed.');
                    }}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={{
                            height: 50,
                            width: width - 110,
                            marginBottom: 10,
                            marginTop: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#ff5d5a',
                            borderRadius: 4,
                        }}
                            onPress={() => { this._pickImage() }}
                        >
                            <Text style={{ color: 'white', fontFamily: 'font1', fontSize: 14, position: 'relative', top: 2 }}>Cambiar imagen</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{
                            height: 50,
                            width: width - 110,
                            marginBottom: 5,
                            marginTop: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#3483fa',
                            borderRadius: 4,
                        }}
                            onPress={() => { this.remove() }}>
                            <Text style={{ color: 'white', fontFamily: 'font1', fontSize: 14, position: 'relative', top: 2 }}>Borrar imagen</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{
                            height: 30,
                            width: width - 110,
                            marginBottom: 15,
                            marginTop: 15,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                            onPress={() => { this.setState({ modalVisible: false, itemSelected: null }) }}>
                            <Text>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <ScrollView >
                    <View style={{ width: width }}>

                        <View>
                            <Text style={{ fontFamily: 'font2', fontSize: 20 }}>Estás por editar tu propiedad</Text>
                        </View>

                        <View style={{ marginTop: 15 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 16 }}>Fotos de tu propiedad</Text>
                        </View>
                        <View style={{ flex: 1, flexWrap: 'wrap', flexDirection: 'row', marginTop: 15 }}>
                            {this.state.product.images.map(element => {
                                return (
                                    <TouchableOpacity onPress={() => this.editItem(element)}>
                                        <Image source={{ uri: element.uri }} style={{ flex: 1, width: (width) / 3 - 4, height: (width) / 3 - 4, margin: 1.5 }} />
                                    </TouchableOpacity>
                                )
                            })}

                            <View>
                                <TouchableOpacity onPress={() => { this._pickImage(true) }} style={{ flex: 1, backgroundColor: '#ededed', justifyContent: 'center', alignItems: 'center', width: (width) / 3 - 4, height: (width) / 3 - 4, margin: 1.5 }} >
                                    <Text style={{ fontSize: 26 }}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ marginTop: 30 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 16 }}>Titulo de tu publicación</Text>
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" placeholder="0" value={this.state.product.name} onChangeText={e => { this.state.product.name = e; this.forceUpdate() }} />
                        </View>

                        <View style={{ marginTop: 30 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 16 }}>Descripción</Text>
                            <TextInput style={styles.inputBuscador2} placeholderTextColor="#000000" placeholder="0" multiline={true} numberOfLines={3} value={this.state.product.description} onChangeText={e => { this.state.product.description = e; this.forceUpdate() }} />
                        </View>

                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontFamily: 'font1', fontSize: 18 }}>¿Que tipo de propiedad es?</Text>
                        </View>
                        <View style={{ marginTop: 15, position: 'relative' }}>
                            <RNPickerSelect
                                style={styles.inputBuscador}
                                placeholder={{
                                    label: 'Hacemé click para seleccionar el tipo de propiedad',
                                    value: this.state.product.tipoPropiedad,
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
                                width: width,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                position: 'relative',
                                elevation: 3,
                                marginTop: 10
                            }}
                                onPress={() => this.togglePrestaciones()}>
                                <View style={{
                                    position: 'absolute', justifyContent: 'center',
                                    alignItems: 'center', left: 10, top: 7, height: 30, width: 30, borderRadius: 50, backgroundColor: '#ff5d5a'
                                }}>
                                    <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1, }}>
                                        {this.countPrestaciones()}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: 'font3', fontSize: 16, color: '#ff5d5a', position: 'relative', top: 1, paddingRight: 5, }}>Seleccionar las prestaciones </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 40 }}>
                            <Text style={{ fontFamily: 'font1', fontSize: 18 }}>¿Cuales son las normas?</Text>
                            <TouchableOpacity style={{
                                backgroundColor: 'white',
                                borderWidth: 2,
                                borderColor: '#3483fa',
                                height: 50,
                                width: width,
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                position: 'relative',
                                elevation: 3,
                                marginTop: 10
                            }}
                                onPress={() => this.toggleNormas()}>
                                <View style={{
                                    position: 'absolute', justifyContent: 'center',
                                    alignItems: 'center', left: 10, top: 7, height: 30, width: 30, borderRadius: 50, backgroundColor: '#3483fa'
                                }}>
                                    <Text style={{ color: 'white', fontFamily: 'font2', position: 'relative', top: 1, }}>
                                        {this.countNormas()}
                                    </Text>
                                </View>
                                <Text style={{ fontFamily: 'font3', fontSize: 16, color: '#3483fa', position: 'relative', top: 1, paddingRight: 5, }}>Seleccionar las normas </Text>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text style={{ fontFamily: 'font3', fontSize: 21, alignSelf: 'center', marginTop: 40 }}>¿Qué exposicion queres?</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'column', flexWrap: 'wrap', marginTop: 20 }}>
                            <TouchableOpacity
                                onPress={() => { this.state.product.plan = 0; this.forceUpdate() }}
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
                                    marginBottom: 20,
                                }}>
                                <View style={{
                                    position: 'absolute', left: 0, top: 0, backgroundColor: (this.state.product.plan === 0) ? '#3483fa' : '#eee',
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
                                onPress={() => { this.state.product.plan = 1; this.forceUpdate() }}
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
                                    marginBottom: 10,
                                    marginRight: 10,
                                    marginLeft: 10
                                }}>
                                <View style={{
                                    position: 'absolute', left: 0, top: 0, backgroundColor: (this.state.product.plan !== 0) ? '#3483fa' : '#eee',
                                    width: 20, height: 90, borderTopLeftRadius: 4, borderBottomLeftRadius: 4
                                }} />
                                <View style={{ position: 'relative', left: 30 }}>
                                    <Text style={{ fontFamily: 'font2', fontSize: 20 }} >
                                        Plan Gold
                                    </Text>
                                    <Text style={{ marginTop: 2 }}>
                                        Exposicion alta
                                   </Text>
                                    <Text style={{ marginTop: 5 }}>
                                        17% Comision
                                    </Text>
                                </View>

                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 40, marginBottom: 0 }}>
                            <Text style={{ fontFamily: 'font3', fontSize: 16 }}>Precio por noche</Text>
                            <TextInput style={styles.inputBuscador} placeholderTextColor="#000000" keyboardType='numeric' value={this.state.product.price.toString()} onChangeText={(e) => { this.state.product.price = e; this.forceUpdate() }} />
                        </View>

                        <View style={{ marginTop: 0, marginBottom: 20 }}>
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
                                <Text style={{ flex: 0.3, color: '#3483fa', fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${this.state.product.price}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text style={{ flex: 0.7, fontSize: 17, fontFamily: 'font3' }}>Comisión del {(this.state.product.plan === 0) ? '13%' : '17%'}: </Text>
                                <Text style={{ flex: 0.3, fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${Math.round((this.state.product.plan === 0) ? (Number(this.state.product.price) * 13 / 100) : Number(this.state.product.price) * 17 / 100)}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text style={{ flex: 0.7, fontSize: 17, fontFamily: 'font3' }}>Gastos de limpieza (Por alquiler): </Text>
                                <Text style={{ flex: 0.3, fontSize: 17, fontFamily: 'font3', justifyContent: 'center', alignItems: 'center', textAlign: 'right' }}>$170</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>

                                <Text style={{ flex: 0.7, color: '#39b54a', fontSize: 17, fontFamily: 'font3' }}>Tu beneficio por día: </Text>
                                <Text style={{ flex: 0.3, color: '#39b54a', fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${Math.round(Number(this.state.product.price) - ((this.state.product.plan === 0) ? Number(this.state.product.price) * 13 / 100 : Number(this.state.product.price) * 17 / 100))}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>

                                <Text style={{ flex: 0.7, color: '#39b54a', fontSize: 17, fontFamily: 'font3' }}>Tu beneficio aproximado por mes: </Text>
                                <Text style={{ flex: 0.3, color: '#39b54a', fontSize: 17, fontFamily: 'font3', textAlign: 'right' }}>${Math.round((Number(this.state.product.price) - ((this.state.product.plan === 0) ? Number(this.state.product.price) * 13 / 100 : Number(this.state.product.price) * 17 / 100)) * 29)}</Text>
                            </View>

                        </View>



                        <View style={{ paddingBottom: 75 }}>

                        </View>
                    </View>

                </ScrollView>
                <TouchableOpacity style={styles.btnSiguiente} onPress={() => { this.saveProduct() }}>
                    <Text style={{
                        color: 'white', fontSize: 20, fontFamily: 'font3', borderTopLeftRadius: 5,
                        borderTopRightRadius: 5
                    }}
                    >
                        Guardar
                        </Text>
                </TouchableOpacity>
                {this.showPrestaciones()}
                {this.showNormas()}
            </View >

        )
    }
}


const styles = StyleSheet.create({
    btnSiguiente: {
        height: 55,
        width: width + 30,
        position: 'absolute',
        left: 0,
        bottom: 0,
        backgroundColor: '#ff5d5a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBuscador: {
        height: 50,
        width: width,
        padding: 15,
        marginTop: 5,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    inputBuscador2: {
        minHeight: 115,
        width: width,
        marginTop: 5,
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        elevation: 20,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        position: 'relative',
        top: he / 2 - 100,
        width: width - 80,
        left: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,

        elevation: 13,
    },
});