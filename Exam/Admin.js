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
export default class Admin extends React.Component {

    constructor(props) {
        super(props);

        this.baseUrl = global.baseUrl;


        this.state = {
            purchased: dataSource.cloneWithRows(global.purchased),
            confirmed: dataSource.cloneWithRows(global.confirmed),
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
                            this.setState(
                                prevState => {
                                    return Object.assign({}, prevState, {
                                        confirmed: dataSource.cloneWithRows(global.confirmed),
                                        purchased: dataSource.cloneWithRows(global.purchased),
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
            console.log("Making request to Seats : " + this.baseUrl + 'seats');
            let response = await fetch(
                this.baseUrl + "confirmed",
                {
                    method: 'GET',
                });
            if (response.status < 400) {
                let responseJson = await response.json();
                let items = responseJson;
                global.confirmed = [];
                for (let index = 0; index < items.length; index++) {
                    const element = items[index];
                    global.confirmed.push(element);
                }
            } else {
                console.log(response._bodyText);
                ToastAndroid.show(JSON.parse(response._bodyText).text, ToastAndroid.SHORT);
            }

            response = await fetch(
                this.baseUrl + "taken",
                {
                    method: 'GET',
                });
            if (response.status < 400) {
                responseJson = await response.json();
                items = responseJson;
                global.purchased = [];
                for (let index = 0; index < items.length; index++) {
                    const element = items[index];
                    global.purchased.push(element);
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

    renderRow(item)
{
    return (
        <TouchableOpacity onPress={() => { }}>
            <View>
                <Text>{item.name}</Text>
                <Text>{item.type}</Text>
                <Text>{item.status}</Text>
                {/* <Button onPress={() => {
                    this.confirm(item);
                }}
                    title="Confirm"
                /> */}
            </View>
        </TouchableOpacity>
    );
}

async clear(){
    try {
        let response = await fetch(
            this.baseUrl + "zap",
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

    render(){
        return(
            
            <View style={styles.container}>
                {(this.state.isDone || true )&&
                    <View>
                        <ListView dataSource={this.state.confirmed} renderRow={this.renderRow.bind(this)} />
                        <ListView dataSource={this.state.purchased} renderRow={this.renderRow.bind(this)} />
                        <Button
                            onPress={() => {
                                this.clear();
                            }}
                            title="Delete"
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