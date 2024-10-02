import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Linking, View, Image, Dimensions, ActivityIndicator, PermissionsAndroid, Alert } from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import axios from "axios";
import moment from "moment";

const NFCScanner = ({ route, navigation }) => {
    const { projectname, email, password, remarks, picture } = route.params;

    const [scan, setScan] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timestamp, setTimestamp] = useState("");

    const deviceWidth = Dimensions.get("screen").width;
    const deviceHeight = Dimensions.get("screen").height;
    const minButtonSize = 220; // Adjust this as needed

    const styles = {
        scrollViewStyle: {
            flex: 1,
            justifyContent: "flex-start",
            backgroundColor: "#2196f3",
        },
        header: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: 80,
            paddingLeft: 15,
            paddingTop: 10,
            width: deviceWidth,
        },
        textTitle: {
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
            padding: 16,
            color: "white",
        },
        textTitle1: {
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
            padding: 16,
            color: "white",
        },
        textTitle2: {
            fontWeight: "bold",
            fontSize: 18,
            textAlign: "center",
            padding: 16,
            color: "#2196f3",
        },
        cardView: {
            width: deviceWidth - 32,
            height: deviceHeight - 200,
            alignSelf: "center",
            justifyContent: "flex-start",
            alignItems: "center",
            borderRadius: 10,
            padding: 25,
            marginLeft: 5,
            marginRight: 5,
            backgroundColor: "white",
        },
        scanCardView: {
            width: deviceWidth - 32,
            height: deviceHeight / 2,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 10,
            padding: 25,
            marginLeft: 5,
            marginRight: 5,
            marginTop: 10,
            backgroundColor: "white",
        },
        buttonWrapper: {
            flexDirection: "row",
            alignItems: "center",
        },
        buttonScan: {
            borderWidth: 2,
            borderRadius: 10,
            borderColor: "#258ce3",
            padding: 10,
            marginTop: 20,
            width: minButtonSize, // Ensure minimum width
            minHeight: 60, // Ensure minimum height
        },
        iconContainer: {
            width: 40, // Fixed width for icon container to maintain alignment
            alignItems: "center",
        },
        textContainer: {
            flex: 1, // Use the remaining space
            alignItems: "center", // Center horizontally
            justifyContent: "center", // Center vertically
        },
        buttonScan2: {
            marginLeft: deviceWidth / 2 - 50,
            width: 100,
            height: 100,
        },
        descText: {
            padding: 16,
            textAlign: "center",
            fontWeight: "500",
            fontSize: 16,
        },
        centerText: {
            flex: 1,
            textAlign: "center",
            fontSize: 30,
            padding: 32,
            gap: 10,
            color: "#2196f3",
        },
        bottomContent: {
            width: deviceWidth,
            height: 120,
        },
        buttonTextStyle: {
            color: "black",
            fontWeight: "bold",
        },
    };

    let file;

    if (picture) {
        file = {
            uri: picture,
            name: "image.jpg",
            type: "image/jpeg",
        };
    }


    useEffect(() => {
        const requestNfcPermission = async () => {
            try {
                const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.NFC);
                if (hasPermission) {
                    console.log("You already have NFC permission");
                    await NfcManager.start();
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.NFC,
                        {
                            title: "NFC Permission",
                            message: "This app needs access to your NFC.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log("You can use NFC");
                        await NfcManager.start();
                    } else {
                        Alert.alert("NFC permission denied");
                    }
                }
            } catch (err) {
                console.warn(err);
            }
        };

        requestNfcPermission();

        return () => {
            NfcManager.stop();
            NfcManager.setEventListenerScheme('stateChange', 'remove');
        };
    }, []);

    const readNFC = async () => {
        try {
            await NfcTech.Ndef.connect();
            const tag = await NfcTech.Ndef.getNdefMessage();
            if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
                const nfcData = tag.ndefMessage[0].payload;
                const decodedData = new TextDecoder("utf-8").decode(nfcData);
                setScanResult(decodedData);
                const formattedTimestamp = moment().format("DD/MM/YYYY HH:mm:ss");
                setTimestamp(formattedTimestamp);
            } else {
                Alert.alert("Error", "NFC tag is null or invalid");
                console.error("NFC tag is null or invalid");
            }
        } catch (ex) {
            console.warn(ex);
            Alert.alert("Error", "An error occurred while reading NFC. Please try again.");
        } finally {
            NfcTech.Ndef.setEventListenerEnabled(false);
            await NfcTech.Ndef.disconnect();
        }
    };



    const handleLogin = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("nfc_data", scanResult);
            formData.append("timestamp", timestamp);
            formData.append("projectname", projectname);
            formData.append("email", email);
            formData.append("remarks", remarks);

            if (file) {
                formData.append("file", file);
            }

            const response = await axios.post(
                "https://acer.avensys-srl.com/app/nfc",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            setLoading(false);
            if (response.data.message === "success") {
                Linking.openURL(
                    "https://acer.avensys-srl.com/appautologin?email=" +
                    email +
                    "&password=" +
                    password
                );
            }
            console.log(response.data);
        } catch (error) {
            setLoading(false);
            console.error(
                "There was an error!",
                error.response ? error.response : error.message
            );
            alert("Login Error", "An error occurred during login.");
        }
    };

    const startScan = async () => {
        setScan(true);
        try {
            await readNFC();
        } catch (error) {
            console.warn("Error starting scan:", error);
        }
    };

    const resetScan = () => {
        setScan(false);
        setScanResult(null);
    };

    return (
        <View style={styles.scrollViewStyle}>
            <View style={styles.header}>
                <Text style={styles.textTitle}>Scan NFC Tag</Text>
            </View>
            {!scan && !scanResult && (
                <View style={styles.cardView}>
                    <Image
                        source={require("./assets/nfc-button.png")}
                        style={{ height: 36, width: 36 }}
                    />
                    <Text numberOfLines={8} style={styles.descText}>
                        Please move your mobile on NFC antenna
                    </Text>
                    <Image
                        source={require("./assets/nfc-logo.png")}
                        style={{ margin: 20, height: 100, width: 100 }}
                    />
                    <TouchableOpacity onPress={startScan} style={styles.buttonScan}>
                        <View style={styles.buttonWrapper}>
                            <View style={styles.iconContainer}>
                                <Image
                                    source={require("./assets/nfc-button.png")}
                                    style={{ height: 36, width: 36 }}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={{ ...styles.buttonTextStyle, color: "#2196f3" }}>
                                    Scan NFC
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
            {scan && (
                <View style={styles.scanCardView}>
                    <Text style={styles.centerText}>Scanning...</Text>
                    {loading && <ActivityIndicator size="large" color="#2196f3" />}
                </View>
            )}
            {scanResult && (
                <View style={styles.cardView}>
                    <Text style={styles.textTitle2}>Result: {scanResult}</Text>
                    <TouchableOpacity onPress={handleLogin} style={styles.buttonScan}>
                        <View style={styles.buttonWrapper}>
                            <View style={styles.iconContainer}>
                                <Image
                                    source={require("./assets/icon.png")}
                                    style={{ height: 35, width: 35 }}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={{ ...styles.buttonTextStyle, color: "#2196f3" }}>
                                    Submit NFC Data
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={resetScan} style={styles.buttonScan}>
                        <View style={styles.buttonWrapper}>
                            <View style={styles.iconContainer}>
                                <Image
                                    source={require("./assets/icon.png")}
                                    style={{ height: 35, width: 35 }}
                                />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={{ ...styles.buttonTextStyle, color: "#2196f3" }}>
                                    Scan Again
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default NFCScanner;
