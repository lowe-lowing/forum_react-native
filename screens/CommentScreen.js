import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth, database } from '../firebase'
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

// TODO: Like comment?
const CommentScreen = ({route}) => {
    const [comments, setComments] = useState()
    const [inputText, setInputText] = useState()
    const postId = route.params

    async function publishComment() {
        const user = auth.currentUser
        const docRef = doc(database, "Posts", postId);
        const docSnap = await getDoc(docRef);
        let commentsArray = docSnap.data().comments !== undefined ? docSnap.data().comments : []
        commentsArray.push({comment: inputText, username: user.displayName})
        await updateDoc(docRef, {
            comments: commentsArray
        });
    }

    function getComments() {
        const docRef = doc(database, "Posts", postId);
        
        onSnapshot(docRef, (snaphot) => {
            const comments = snaphot.data().comments
            
            if (comments !== undefined && comments.length > 0) {
                let commentsArray = []
                snaphot.data().comments.forEach((element, i) => {
                    commentsArray.push(
                    <View key={i} style={styles.commentContainer}>
                        <Text style={styles.username}>{element.username}</Text>
                        <Text>{element.comment}</Text>
                    </View>)
                });
                setComments(commentsArray)
            }
            else {
                setComments(<View style={styles.noComments}><Text>No comments yet</Text></View>)
            }
        })
    }
    useEffect(() => {
        const unsubscribe = getComments()
        return unsubscribe
    }, [])
    
    return (
        <>
            <ScrollView>
                {comments}
            </ScrollView>
            <View style={styles.inputContainer}>
                <View style={styles.inputView}>
                    <TextInput
                        placeholder="Add comment"
                        value={inputText}
                        onChangeText={text => setInputText(text)}
                        style={styles.input}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button title={"Publish"} onPress={() => {publishComment(); setInputText('')} } style={styles.button} />
                </View>
            </View>
        </>
    )
}

export default CommentScreen

const styles = StyleSheet.create({
    commentContainer: {
        flexDirection: "row",
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10,
        marginBottom: 5
    },
    username: {
        fontWeight: 'bold',
        marginRight: 10
    },
    inputContainer: {
        flexDirection: 'row',
        borderColor: 'grey',
        borderWidth: 1,
        justifyContent: 'space-between'
    },
    inputView: {
    },
    input: {
        padding: 15,
        paddingRight: 210
    },
    buttonContainer: {
        padding: 10
    },
    button: {
        margin: 20
    },
    noComments: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
})