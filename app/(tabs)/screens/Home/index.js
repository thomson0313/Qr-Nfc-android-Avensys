import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	SafeAreaView,
	StyleSheet,
	Image,
	TextInput,
	TouchableOpacity,
	Alert,
} from "react-native";
import axios from "axios";

axios.defaults.withCredentials = true;
const minButtonSize = 220;

const Home = ({ route, navigation }) => {
	const { email, password } = route.params;
	const [projectname, setProjectname] = useState("");
	const [skipFlag, setSkipFlag] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setSkipFlag(!!projectname);
	}, [projectname]);

	const handleQR = async () => {
		if (!projectname) setProjectname(" ");
		setLoading(true);
		navigation.navigate("QRCodeReader", { projectname, email, password });
	};

	const handleNFC = () => {
		if (!projectname) setProjectname(" ");
		setLoading(true);
		navigation.navigate("NFCScanner", { projectname, email, password });
	};

	return (
		<SafeAreaView style={styles.body}>
			<View style={styles.logo_area}>
				<Image
					source={require("../../assets/avensys_logo.png")}
					style={{ width: 230, height: 130 }}
				/>
			</View>
			<View style={styles.form}>
				<View style={styles.item}>
					<Text style={styles.or_text}>Project Name</Text>
					<TextInput
						style={styles.input}
						placeholder={"Project Name"}
						value={projectname}
						onChangeText={setProjectname}
					/>
				</View>
				{/* <View style={styles.login}>
					{skipFlag ? (
						<TouchableOpacity onPress={handleProjectName} disabled={loading}>
							<Text style={styles.login_text}>
								{loading ? "Loading..." : "S U B M I T"}
							</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity onPress={handleSkip} disabled={loading}>
							<Text style={styles.login_text}>
								{loading ? "Loading..." : "S K I P"}
							</Text>
						</TouchableOpacity>
					)}
				</View> */}
				<TouchableOpacity onPress={handleQR} style={styles.buttonScan} disabled={loading}>
					{
						loading ?
							<Text style={styles.login_text}>
								Loading...
							</Text>
							:
							<View style={styles.buttonWrapper}>
								<View style={styles.iconContainer}>
									<Image
										source={require("../QRCodeReader/assets/camera.png")}
										style={{ height: 36, width: 36 }}
									/>
								</View>
								<View style={styles.textContainer}>
									<Text style={{ ...styles.buttonTextStyle, color: "white" }}>
										Scan QR Code
									</Text>
								</View>
							</View>
					}
				</TouchableOpacity>
				<TouchableOpacity onPress={handleNFC} style={styles.buttonScan} disabled={loading}>
					{
						loading ?
							<Text style={styles.login_text}>
								Loading...
							</Text> :

							<View style={styles.buttonWrapper}>
								<View style={styles.iconContainer}>
									<Image
										source={require("../NFCScanner/assets/nfc-button.png")}
										style={{ height: 36, width: 36 }}
									/>
								</View>
								<View style={styles.textContainer}>
									<Text style={{ ...styles.buttonTextStyle, color: "white" }}>
										Scan NFC
									</Text>
								</View>
							</View>
					}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Home;

const styles = StyleSheet.create({
	body: {
		backgroundColor: "white",
		flex: 1,
	},
	logo_area: {
		alignItems: "center",
		gap: 25,
	},
	form: {
		marginTop: 40,
	},
	input: {
		borderWidth: 1,
		borderColor: "#B0B0C3",
		backgroundColor: "#F7F7F7",
		padding: 17,
		borderRadius: 10,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 5,
	},
	item_text: {
		color: "#0EACF9",
		fontWeight: "700",
		textAlign: "right",
		marginRight: 10,
		marginTop: 10,
	},
	login: {
		backgroundColor: "#0EACF9",
		padding: 20,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 20,
	},
	login_text: {
		textAlign: "center",
		color: "white",
		fontWeight: "700",
		fontSize: 14,
		marginTop: 7
	},
	or_text: {
		textAlign: "left",
		color: "#525464",
		fontSize: 18,
		marginLeft: 15,
		marginTop: 10,
		fontWeight: "600",
	},
	register: {
		textDecorationLine: "underline",
		color: "#FFB19D",
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
		backgroundColor: '#258ce3',
		margin: "auto",
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
	buttonTextStyle: {
		color: "black",
		fontWeight: "bold",
	},
});
