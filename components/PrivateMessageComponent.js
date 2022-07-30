import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { auth, database, storage } from '../firebase'
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

const PrivateMessageComponent = () => {
    const navigation = useNavigation()
    const memberId = navigation.getState().routes[1].params.id
    const user = auth.currentUser

    const [userInfo, setUserInfo] = useState({})
    const [imageUrl, setImageUrl] = useState()
    const [input, setInput] = useState("")
    const [buttonDisabled, setButtonDisabled] = useState(true)
    
    const [messageRenderer, setMessageRenderer] = useState()

    function getMessages() {
        const q = query(
            collection(database, "Messages"),
            where("connection", "in", [user.uid+memberId, memberId+user.uid]),
            orderBy("createdAt", 'asc')
          )
          onSnapshot(q, (snapshot) => {
            let arr = []
            let i = 0;
            snapshot.forEach(doc => {
                const data = JSON.parse(JSON.stringify(doc.data()))
                const sent = data.from === user.uid
                arr.push(
                    sent ? 
                    <View key={i} style={styles.sent}>
                        <Text style={styles.sentText}>{data.message}</Text>
                    </View> :
                    <View key={i} style={styles.recieved}>
                        <Image source={imageUrl?{uri:imageUrl}:require("../assets/icons/default_pfp.png")} style={styles.profilePicture}/>
                        <Text style={styles.recievedText}>{data.message}</Text>
                    </View>
                )
                i++
            });
            setMessageRenderer(arr)
        })
    }

    async function sendMessage() {
        setInput("")
        await addDoc(collection(database, "Messages"), {
            message: input,
            from: user.uid,
            to: memberId,
            connection: user.uid+memberId,
            createdAt: serverTimestamp(),
          });
    }

    useEffect(() => {
        async function getMemberInfo() {
            const docRef = doc(database, "userInfo", memberId)
            const docSnap = await getDoc(docRef)
            const docData = docSnap.data()
            setUserInfo(docData)
            const downmloadUrl = await getDownloadURL(ref(storage, memberId + ".png")).catch(() => (null))
            setImageUrl(downmloadUrl)
            navigation.setOptions(({
                headerTitle: () => (
                <View style={styles.navigationHeader}>
                    <Image source={downmloadUrl?{uri:downmloadUrl}:require("../assets/icons/default_pfp.png")} style={styles.headerImage}/>
                    <View style={styles.nameSeparator}>
                        <Text style={styles.headerTitle}>{docData.name}</Text>
                        <Text style={styles.headerName}>{docData.username}</Text>
                    </View>
                </View>)
            }))
        }
        getMemberInfo()
        const unsubscribe = () => {
            getMessages()
        }
        return unsubscribe()
    }, [imageUrl, setImageUrl])

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

export default PrivateMessageComponent

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
        margin: 10,
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
        margin: 5,
        // maxWidth: '50%'
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
        padding: 8,
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
    }
})