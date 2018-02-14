import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';
import { NavigationActions } from 'react-navigation';
export default class Main extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <Button
                    onPress={() => {
                        this.props.navigation.navigate("Client", {});
                    }}
                    title="Client"
                />
                <Button
                    onPress={() => {
                        this.props.navigation.navigate("Theater", {});
                    }}
                    title="Theater"
                />
                <Button
                    onPress={() => {
                        this.props.navigation.navigate("Admin", {});
                    }}
                    title="Admin"
                />
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
});