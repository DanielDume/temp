import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    TouchableOpacity,
    NetInfo,
    AsyncStorage,
    TextInput,
    Button,
    ActivityIndicator,
    ToastAndroid
} from 'react-native';
var dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => { return r1.id !== r2.id; } });

export default class Theater extends React.Component {

    constructor(props) {
        super(props);

        this.baseUrl = global.baseUrl;

        this.state = {
            theaterArray: dataSource.cloneWithRows(global.theaterArray),
            isOnline: false,
            isDone: true,
        }
        this.refresh();
    }

    refresh() {

        NetInfo.addEventListener(
            'connectionChange',
            (connectionInfo) => {
                console.log('First change, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
                console.log("CHANGED NETWORK STATUS");
            }
        );

        NetInfo.getConnectionInfo().then((connectionInfo) => {
            console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
            if (connectionInfo.type == 'none') {
                try {
                    alert("You must be online");
                    global.theaterArray = [];
                    this.setState(prevState => {
                        return Object.assign({}, prevState, {
                            theaterArray: dataSource.cloneWithRows(global.theaterArray),
                            isOnline: false
                        });
                    });
                }
                catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    this.initArray().then(
                        () => {
                            AsyncStorage.setItem("localTheater", JSON.stringify(global.theaterArray));
                            this.setState(
                                prevState => {
                                    return Object.assign({}, prevState, {
                                        theaterArray: dataSource.cloneWithRows(global.theaterArray),
                                        isOnline: true
                                    })
                                }
                            );
                        },
                        () => {
                            console.log("Error connecting to network");
                        }
                    );
                }
                catch (error) {
                    alert(error);
                    console.log(error);
                }
            }
        }
        );

    }

    async initArray() {
        try {
            //var localReserved = await AsyncStorage.getItem("localReserved");
            // console.log("RESERVED LOCALLY -----------------");
            // console.log(localReserved);
            // if (localReserved) {
            //     global.reserved = JSON.parse(localReserved);
            // } else {
            //     global.reserved = [];
            // }
            console.log("Making request to Seats : " + this.baseUrl + 'seats');
            let response = await fetch(
                this.baseUrl + "all",
                {
                    method: 'GET',
                });
            if (response.status < 400) {
                let responseJson = await response.json();
                let items = responseJson;
                global.theaterArray = [];
                for (let index = 0; index < items.length; index++) {
                    const element = items[index];
                    global.theaterArray.push(element);
                }
            } else {
                console.log(response._bodyText);
                ToastAndroid.show(JSON.parse(response._bodyText).text, ToastAndroid.SHORT);
            }

        }
        catch (error) {
            console.log("Error : " + error);
        }
    }

    async confirm(item) {
        if (item.status != 'reserved') {
            alert("Must dconfirm reserved seat");
            return;
        }

        var locId = item.id;

        try {
            this.setState(
                prevState => {
                    return Object.assign({}, prevState, {
                        isDone: false
                    })
                }
            );
            var item = {
                'id': locId
            }
            console.log("Item to be reserved " + item);
            const formBody = Object.keys(item).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(item[key])).join('&');
            var response = await fetch(
                this.baseUrl + 'confirm',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formBody,
                }
            );
            if (response.status < 400) {
                let responseJson = await response.json();
                let item = responseJson;
                for (let index = 0; index < global.theaterArray.length; index++) {
                    const element = global.theaterArray[index];
                    if (element.id == locId) {
                        element.status = 'confirmed'
                    }
                }
                this.setState(
                    prevState => {
                        return Object.assign({}, prevState, {
                            theaterArray: dataSource.cloneWithRows(global.theaterArray),
                            isDone: true
                        })
                    }
                );
            } else {
                console.log(response._bodyText);
                ToastAndroid.show(JSON.parse(response._bodyText).text, ToastAndroid.SHORT);
                this.setState(
                    prevState => {
                        return Object.assign({}, prevState, {
                            isDone: true
                        })
                    }
                );
            }
        }
        catch (error) {
            console.log("Error : " + error);
            this.setState(
                prevState => {
                    return Object.assign({}, prevState, {
                        isDone: true
                    })
                }
            );
        }


    }

    renderRow(item) {
        return (
            <TouchableOpacity onPress={() => { }}>
                <View>
                    <Text>{item.name}</Text>
                    <Text>{item.type}</Text>
                    <Text>{item.status}</Text>
                    <Button onPress={() => {
                        this.confirm(item);
                    }}
                        title="Confirm"
                    />
                </View>
            </TouchableOpacity>
        );
    }

    async clear(){
        try {
            let response = await fetch(
                this.baseUrl + "clean",
                {
                    method: 'DELETE',
                });
            if (response.status < 400) {
                let responseJson = await response.json();
                this.refresh();
                // let items = responseJson;
                // global.theaterArray = [];
                // for (let index = 0; index < items.length; index++) {
                //     const element = items[index];
                //     global.theaterArray.push(element);
                // }
            } else {
                console.log(response._bodyText);
                ToastAndroid.show(JSON.parse(response._bodyText).text, ToastAndroid.SHORT);
            }

        }
        catch (error) {
            console.log("Error : " + error);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.isDone &&
                    <View>
                        <ListView dataSource={this.state.theaterArray} renderRow={this.renderRow.bind(this)} />
                        <Button
                            onPress={() => {
                                this.clear();
                            }}
                            title="Clear"
                        />
                    </View>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    input: {
        width: 200,
    },
});