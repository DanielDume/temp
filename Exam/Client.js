/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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

import SyncHelper from './SyncHelper';

var dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => { return r1.id !== r2.id; } });
export default class Client extends React.Component {

    constructor(props) {
        super(props);

        this.baseUrl = global.baseUrl;

        this.syncHelper = SyncHelper.getInstance();

        this.state = {
            dataSource: dataSource.cloneWithRows(global.dataArray),
            reserved: dataSource.cloneWithRows(global.reserved),
            isOnline: false,
            isDone: true,
            name: '',
            type: '',
            budget: 0,
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
                    this.initArrayFromLocal().then(
                        () => {
                            this.setState(
                                prevState => {
                                    return Object.assign({}, prevState, {
                                        dataSource: dataSource.cloneWithRows(global.dataArray),
                                        reserved: dataSource.cloneWithRows(global.reserved),
                                        isOnline: false
                                    })
                                }
                            );
                        },
                        () => {
                            console.log("ERROR");
                        }
                    );
                    global.dataArray = [];
                    this.setState(prevState => {
                        return Object.assign({}, prevState, {
                            dataSource: dataSource.cloneWithRows(global.dataArray),
                            isOnline: false
                        });
                    });
                }
                catch (error) {
                    console.log(error);
                }
                //this.setState(prevState => { return Object.assign({}, prevState, { dataSource: dataSource.cloneWithRows(global.dataArray) }) });
            } else {
                try {
                    this.initArray().then(
                        () => {
                            AsyncStorage.setItem("localList", JSON.stringify(global.dataArray));
                            this.setState(
                                prevState => {
                                    return Object.assign({}, prevState, {
                                        dataSource: dataSource.cloneWithRows(global.dataArray),
                                        reserved: dataSource.cloneWithRows(global.reserved),
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
            var localReserved = await AsyncStorage.getItem("localReserved");
            // console.log("RESERVED LOCALLY -----------------");
            // console.log(localReserved);
            if (localReserved) {
                global.reserved = JSON.parse(localReserved);
            } else {
                global.reserved = [];
            }
            console.log("Making request to Seats : " + this.baseUrl + 'seats');
            let response = await fetch(
                this.baseUrl + "seats",
                {
                    method: 'GET',
                });
            if (response.status < 400) {
                let responseJson = await response.json();
                let items = responseJson;
                global.dataArray = [];
                for (let index = 0; index < items.length; index++) {
                    const element = items[index];
                    global.dataArray.push(element);
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

    async initArrayFromLocal() {
        var localItems = await AsyncStorage.getItem("localList");
        //console.log(localItems);
        if (localItems) {
            global.dataArray = JSON.parse(localItems);
        } else {
            global.dataArray = [];
        }
        var localReserved = await AsyncStorage.getItem("localReserved");
        // console.log("RESERVED LOCALLY -----------------");
        // console.log(localReserved);
        if (localReserved) {
            global.reserved = JSON.parse(localReserved);
        } else {
            global.reserved = [];
        }
    }

    async buy(item) {
        if (item.status != 'confirmed') {
            alert("must be confirmed");
            return;
        }
        try {
            this.setState(
                prevState => {
                    return Object.assign({}, prevState, {
                        isDone: false
                    })
                }
            ); 
            var locId = item.id;           
            var item = {
                'id': locId
            }
            console.log("Item to be reserved " + item);
            const formBody = Object.keys(item).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(item[key])).join('&');
            var response = await fetch(
                this.baseUrl + 'buy',
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
                for (let index = 0; index < global.dataArray.length; index++) {
                    const element = global.reserved[index];
                    console.log(element);
                    if (element.id == item.id) {
                        element.status = item.status;
                    }
                }
                AsyncStorage.setItem('localReserved', JSON.stringify(global.reserved));
                this.setState(
                    prevState => {
                        return Object.assign({}, prevState, {
                            reserved: dataSource.cloneWithRows(global.reserved),
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

    async reserve(id) {


        try {
            this.setState(
                prevState => {
                    return Object.assign({}, prevState, {
                        isDone: false
                    })
                }
            );
            var item = {
                'id': id
            }
            console.log("Item to be reserved " + item);
            const formBody = Object.keys(item).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(item[key])).join('&');
            var response = await fetch(
                this.baseUrl + 'reserve',
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
                global.reserved.push(item);
                AsyncStorage.setItem('localList', JSON.stringify(global.dataArray));
                AsyncStorage.setItem('localReserved', JSON.stringify(global.reserved));
                this.setState(
                    prevState => {
                        return Object.assign({}, prevState, {
                            dataSource: dataSource.cloneWithRows(global.dataArray),
                            reserved: dataSource.cloneWithRows(global.reserved),
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
                    <Button onPress={() => {
                        this.reserve(item.id);
                    }}
                        title="Reserve"
                    />
                </View>
            </TouchableOpacity>
        );
    }

    deleteLocal() {
        AsyncStorage.removeItem("localReserved").then(() => {
            this.refresh();
        }, () => { })
    }

    async refreshSeat(id) {
        try {
            this.setState(
                prevState => {
                    return Object.assign({}, prevState, {
                        isDone: false
                    })
                }
            );
            var response = await fetch(
                this.baseUrl + 'refresh/' + id,
                {
                    method: "GET",
                }
            );
            if (response.status < 400) {
                let responseJson = await response.json();
                let item = responseJson;

                for (let index = 0; index < global.dataArray.length; index++) {
                    const element = global.reserved[index];
                    console.log(element);
                    if (element.id == item.id) {
                        element.status = item.status;
                    }
                }
                AsyncStorage.setItem('localReserved', JSON.stringify(global.reserved));
                this.setState(
                    prevState => {
                        return Object.assign({}, prevState, {
                            reserved: dataSource.cloneWithRows(global.reserved),
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

    renderReserved(item) {
        return (
            <TouchableOpacity onPress={() => { }}>
                <View>
                    <Text>{item.name}</Text>
                    <Text>{item.type}</Text>
                    <Text>{item.status}</Text>
                    <Button onPress={() => {
                        this.refreshSeat(item.id);
                    }}
                        title="Refresh"
                    />
                    <Button onPress={() => {
                        this.buy(item);
                    }}
                        title="Buy"
                    />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.isDone &&
                    <View>
                        <ListView dataSource={this.state.dataSource} renderRow={this.renderRow.bind(this)} />
                        <ListView dataSource={this.state.reserved} renderRow={this.renderReserved.bind(this)} />
                        {this.state.isOnline &&
                            <View>
                                {/* <Text>Name: </Text>
                                <TextInput style={styles.input} onChangeText={(name) => this.setState({ name })} />
                                <Text>Type: </Text>
                                <TextInput style={styles.input} onChangeText={(type) => this.setState({ type })} />
                                <Text>Budget:   </Text>
                                <TextInput style={styles.input} keyboardType='numeric' onChangeText={(budget) => this.setState({ budget })} /> */}
                                {/* <Button
                                    onPress={() => {
                                        this.add();
                                    }}
                                    title="Add"
                                />                                 */}
                            </View>
                        }
                        {!this.state.isOnline &&
                            <View>
                                <Text>I AM OFFLINE</Text>
                                <Button
                                    onPress={() => {
                                        this.refresh();
                                    }}
                                    title="Retry"
                                />
                            </View>
                        }
                        <Button onPress={() => {
                            this.deleteLocal();
                        }}
                            title="Delete local reserved"
                        />
                    </View>
                }
                {!this.state.isDone &&
                    <View>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                }
            </View>
        );
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
