import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { auth, database } from '../firebase'
import { useNavigation } from '@react-navigation/native'

const HomeScreen = () => {
    const [posts, setPosts] = useState(null)

    const navigation = useNavigation()

    const username = auth.currentUser.displayName
    async function likePost(postId) {
        const docRef = doc(database, "Posts", postId);
        const docSnap = await getDoc(docRef);
        const postLikes = JSON.parse(JSON.stringify(docSnap.data())).likes
        let likesArray = postLikes !== undefined ? postLikes : []
        const postIsLiked = likesArray.indexOf(username) > -1
        if (!postIsLiked) {
            likesArray.push(username)
            await updateDoc(docRef, {
                likes: likesArray
            });
        } else {
            likesArray.splice(likesArray.indexOf(username), 1)
            await updateDoc(docRef, {
                likes: likesArray
            });
        }
        return;
    }
    // function getPosts() {
    // }
    useEffect(() => {
      const unsubscribe = () => {
        const q = query(collection(database, "Posts"), orderBy("createdAt", 'desc'));
        onSnapshot(q, (snaphot) => {
            let textObj = []
            let i = 1
            snaphot.forEach(async (doc) => {
                const post = JSON.parse(JSON.stringify(doc.data()))
                const docId = JSON.parse(JSON.stringify(doc.id))
                const date = (post.createdAt != null) ? new Date((post.createdAt.seconds * 1000) - (new Date().getTimezoneOffset() * 60 * 1000)) : new Date()
                const parsedDate = JSON.stringify(date.toISOString().split('T')[1].split('.')[0]).split('"')[1]
                textObj.push(
                <View key={i} style={styles.postContainer}>
                    <View style={{ flexDirection: "row"}}>
                        <TouchableOpacity style={{ flexDirection: "row" , alignItems: "center" }}
                            onPress={() => {post.authorId!=auth.currentUser.uid ? 
                                navigation.navigate("Member Profile", { id: post.authorId }) :
                                navigation.navigate("Profile Tab", { screen: "Profile Screen"})}
                            }>
                            <Image source={post.authorPfp?{uri: post.authorPfp}:require("../assets/icons/default_pfp.png")} style={styles.profilePicture}/>
                            <Text style={styles.authorText}>{post.authorUsername}</Text>
                        </TouchableOpacity>
                        <Text style={styles.timestampText}>{parsedDate}</Text>
                    </View>
                    {post.imageUrl && <Image source={{uri: post.imageUrl}} style={{width: 100, height: 100, marginTop: 10}}/>}
                    <Text style={styles.messageText}>{post.message}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => {navigation.navigate("Comments", docId)}}>
                            <Image source={require("../assets/icons/comments.png")} style={{width: 20, height: 20}} />
                        </TouchableOpacity>
                        <Text>{(post.comments != undefined) ? post.comments.length : 0}</Text>
                        <TouchableOpacity style={{marginLeft:5}} onPress={() => { likePost(docId) }}>
                            { (post.likes == undefined || post.likes.indexOf(username)===-1) ?
                            <Image source={require("../assets/icons/heart.png")} style={{width: 20, height: 20}}/> :
                            <Image source={require("../assets/icons/red-heart.png")} style={{width: 20, height: 20}}/>}
                        </TouchableOpacity>
                        <Text>{post.likes != undefined ? post.likes.length : 0}</Text>
                    </View>
                </View>)
                i++
            });
            setPosts(textObj)
        });
      }
      unsubscribe()

      return unsubscribe
    }, [])
    
  return (
    <View style={styles.container}>
        <ScrollView>
            {posts}
        </ScrollView>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column'
    },
    postContainer: {
        flexDirection: 'column',
        width: '100%',
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10
    },
    authorText: {
        fontWeight: 'bold'
    },
    timestampText: {
        marginLeft: 5
    },
    messageText: {

    },
    profilePicture: {
        width: 20,
        height: 20,
        borderRadius: 50,
        marginRight: 5,
    },
})