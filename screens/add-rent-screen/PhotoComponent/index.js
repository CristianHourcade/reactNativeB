import React, { Component } from 'react';
import { StyleSheet, Image, StatusBar, View, Platform, Text, Button, TouchableOpacity, CameraRoll, ScrollView } from 'react-native';
import { Dimensions } from 'react-native';

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full width

export default class PhotoComponent extends Component<any>{

    constructor(props) {
        super(props);
    }

    state = {
        isSelected: false,
        number: 1,
        image: null,
        loaded: false
    }


    selectImage = () => {

        if (this.state.isSelected) {
            this.props.saves.splice(this.props.saves.findIndex(e => e.uri === this.props.image.uri), 1);
        } else {
            this.props.saves.push(this.props.image);
        }

        this.setState({ number: this.props.saves.length, isSelected: !this.state.isSelected });

        this.props.handler();

    }

    componentDidMount() {
        if (!this.state.loaded) {
            // this.DataImage();

            this.setState({ loaded: true, image:this.props.image })
        }

        this.verifySelected();
    }

    componentDidUpdate(props) {
        let aux = 1;

        this.props.saves.map(element => {
            if (element.uri === this.props.image.uri) {

                if (aux !== this.state.number) {

                    this.setState({ isSelected: true, number: aux })

                }
            }
            aux++;
        });
    }

    verifySelected = () => {
        let aux = 0;
        this.props.saves.map(element => {
            if (element === this.props.image) {
                this.setState({ isSelected: true, number: aux })
            }
            aux++;
        });
    }

    async DataImage() {
        // const aux = (width);

        // const image = await ImageManipulator.manipulateAsync(
        //     this.props.image.uri,
        //     [{ resize: { width: aux / 3 } }],
        //     { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG },
        // ).catch(e => alert(e + ''));
        // this.setState({ image: image })
    }

    render() {
        return (
            <TouchableOpacity style={{ position: 'relative' }} onPress={() => this.selectImage()}>

                {(this.state.image) ?
                    (<Image source={this.state.image} style={{ margin: 2, height: (width - 30) / 4 - 4, width: (width - 30) / 4 - 4 }} resizeMode="cover" />)
                    : <View style={{ margin: 2, height: (width - 30) / 4 - 4, width: (width - 30) / 4 - 4, backgroundColor: '#eee' }}></View>
                }
                {(this.state.isSelected) ?
                    <View style={{ width: 20, height: 20, backgroundColor: '#ff5d5a', borderRadius: 50, position: 'absolute', elevation: 10, top: 4, left: 4 }}>
                        <Text style={{ color: 'white', position: 'relative', top: 2, left: 6 }}>
                            {this.state.number}
                        </Text>
                    </View>
                    : <View />
                }
            </TouchableOpacity>
        );
    }
}