import NetInfo from 'react-native';
export default class SyncHelper {

    updateServer = global.baseUrl;
    static instance = null;

    handleFirstConnectivityChange(connectionInfo) {
        console.log("CHANGED NET STATUS");
    }

    constructor() {
        this.newWebSocket();

        // NetInfo.addEventListener(
        //     'connectionChange',
        //     function(connectionInfo){console.log("HEI");}
        // );
    }

    static getInstance() {
        if (this.instance === null) {
            this.instance = new SyncHelper();
        }
        return this.instance;
    }

    newWebSocket() {
        var ws = new WebSocket(this.updateServer);

        ws.onopen = () => {
            console.log("Connected to server");
        };

        ws.onmessage = (e) => {
            var payload = JSON.parse(e.data);
            console.log(JSON.parse(e.data));
            // PushNotification.localNotification(
            //     {
            //         title: "Wishlister App",
            //         message: payload.message,
            //         playSound: false,
            //     }
            // )
        };

    }

}