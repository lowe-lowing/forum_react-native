import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { auth, database } from '../firebase'
import { useNavigation } from '@react-navigation/native'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import ProfilePosts from '../components/ProfilePosts'
import { HeightContext } from '../context/heightContext'

const ProfileScreen = () => {
  const [imageUrl, setImageUrl] = useState()
  const [userInfo, setUserInfo] = useState({})
  const [value, setValue] = useState(100)
  const [amountOfPosts, setAmountOfPosts] = useState(0)

  const user = auth.currentUser
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setImageUrl(user.photoURL)
      const docRef = doc(database, "userInfo", user.uid);
      const docSnap = await getDoc(docRef);
      navigation.setOptions({title: docSnap.data().username})
      setUserInfo(docSnap.data())
      const posts = await getDocs(query(collection(database, "Posts"), where("authorId", "==", user.uid)))
      setAmountOfPosts(posts.size)
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.profileInfo}>
          <Image source={imageUrl?{uri:imageUrl}:require("../assets/icons/default_pfp.png")} style={styles.profilePicture}/>
          <View style={styles.profileStats}>
            <Text style={styles.fontSizeBold}>{amountOfPosts}</Text>
            <Text>Posts</Text>
          </View>
          <View style={styles.profileStats}>
            <Text style={styles.fontSizeBold}>{userInfo.followers ? userInfo.followers.length : 0}</Text>
            <Text>Followers</Text>
          </View>
          <View style={styles.profileStats}>
            <Text style={styles.fontSizeBold}>{userInfo.following ? userInfo.following.length : 0}</Text>
            <Text>Following</Text>
          </View>
        </View>
        <Text>{userInfo.name||""}</Text>
        <Text style={{marginBottom:5}}>{userInfo.biografy||""}</Text>
        <Button style={styles.editProfileButton} onPress={() => {navigation.navigate("Edit Profile")}} title="Edit Profile" />
      </View>
      <HeightContext.Provider value={{value, setValue}}>
        <View style={{height: value, width: '100%'}}>
          {ProfilePosts(user.uid.toString())}
        </View>
      </HeightContext.Provider>
    </ScrollView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  profileInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 10,
    fontSize: 30
  },
  profilePicture: {
    height: 100,
    width: 100,
    borderRadius: 100
  },
  profileStats: {
    flexDirection: "column",
  },
  fontSizeBold: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  fontSize: {
    fontSize: 18,
  },
  editProfileButton: {
    marginTop: 10,
    marginBottom: 10,
  },
})