import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { auth, database } from '../firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'

const GroupRoomScreen = () => {
    const [input, setInput] = useState("")
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [messages, setMessages] = useState([])
    const [messageRenderer, setMessageRenderer] = useState()

    const navigation = useNavigation()
    const user = auth.currentUser

    const SentMessage = (props) => (
            <View style={styles.sent}>
                <View style={{flexDirection: "column"}}>
                    <Text style={styles.sentYou}>You</Text>
                    <Text style={styles.sentText}>{props.message}</Text>
                </View>
            </View>
    )
    const RecievedMessage = (props) => (
            <View style={styles.recieved}>
                <View style={{flexDirection: "column"}}>
                    <Text style={styles.recievedName}>{props.name}</Text>
                    <View style={{flexDirection: "row", alignItems: "center" }}>
                        <Image source={props.img?{uri:props.img}:require("../assets/icons/default_pfp.png")} style={styles.profilePicture}/>
                        <Text style={styles.recievedText}>{props.message}</Text>
                    </View>
                </View>
            </View>
    )

    async function sendMessage() {
        setInput("")
        const groupId = await navigation.getState().routes[1].params.id
        await updateDoc(doc(database, "Groups", groupId), {
            messages: [...messages, {
                message: input,
                from: user.uid,
            }]
          });
    }

    useEffect(() => {
        async function fetchData() {
            const groupId = await navigation.getState().routes[1].params.id
            onSnapshot(doc(database, "Groups", groupId), (snapshot) => {
                let tempArray = []
                const members = snapshot.data().members
                setMessages(snapshot.data().messages)
                snapshot.data().messages.forEach((message, i) => {
                    const sent = message.from === user.uid
                    const member = members.filter(member => member.id === message.from)
                    const pfp = member[0].pfp
                    const usersName = member[0].name
                    tempArray.push(
                        sent ? 
                        <SentMessage key={i} name={usersName} message={message.message}/> :
                        <RecievedMessage key={i} name={usersName} message={message.message} img={pfp}/>
                    )
                })
                setMessageRenderer(tempArray)
            })
        }
        fetchData()

        // return fetchData()
    },[navigation])
    return (
        <View style={styles.container}>
            <ScrollView style={styles.messageContainer}>
                {messageRenderer}
            </ScrollView>
            <View style={styles.sendContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Send message ..."
                        value={input}
                        onChangeText={text => {
                            setInput(text)
                            setButtonDisabled(text == "")
                        }} 
                        style={styles.input}
                    />
                </View>
                <View>
                    <TouchableOpacity onPress={() => sendMessage()} style={styles.sendButton} disabled={buttonDisabled}>
                        <Text style={[styles.sendButtonText, buttonDisabled ? styles.buttonDisabled : styles.buttonActive]}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default GroupRoomScreen

const styles = StyleSheet.create({
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerImage: {
        width: 30, 
        height: 30,
        borderRadius: 50,
        marginRight: 10
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerName: {
        fontSize: 11,
    },
    container: {
        flex: 1,
    },
    messageContainer: {

    },
    sent: {
        flexDirection: 'row-reverse',
    },
    sentText: {
        color: 'black',
        borderRadius: 18,
        backgroundColor: 'lightblue',
        padding: 10,
        marginRight: 10,
        marginTop: 2,
    },
    recieved: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    recievedText: {
        color: 'black',
        borderRadius: 18,
        backgroundColor: 'lightgray',
        padding: 10,
        marginLeft: 5,
        marginTop: 2
    },
    profilePicture: {
        marginLeft: 10,
        borderRadius: 50,
        width: 30, 
        height: 30,
    },
    sendContainer: {
        bottom: 5,
        margin: 5,
        flexDirection: 'row',
        borderRadius: 20,
        borderColor: "gray",
        borderWidth: 2,
        padding: 6,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    inputContainer: {
        width: '80%',
        marginLeft: 10,
    },
    input: {
        width: '100%',
    },
    sendButton: {
        marginRight: 10
    },
    sendButtonText: {
        fontSize: 20,
    },
    buttonActive: {
        color: 'darkturquoise',
    },
    buttonDisabled: {
        color: 'grey'
    },
    recievedName: {
        marginLeft: 10,
        fontSize: 10,
    },
    sentYou: {
        alignSelf: 'flex-end',
        marginRight: 20,
        fontSize: 10,
    }
})