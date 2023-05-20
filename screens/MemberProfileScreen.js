import { Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth, database, storage } from '../firebase'
import { useNavigation } from '@react-navigation/native'
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import ProfilePosts from '../components/ProfilePosts'
import { HeightContext } from '../context/heightContext'

const MemberProfileScreen = () => {
  const [screenUserId, setScreenUserId] = useState("");
  const [imageUrl, setImageUrl] = useState();
  const [userInfo, setUserInfo] = useState({});
  const [following, setFollowing] = useState();
  const [value, setValue] = useState(100);
  const [amountOfPosts, setAmountOfPosts] = useState(0);

  const user = auth.currentUser;
  const navigation = useNavigation();

  async function handleFollow() {
    const screenUserDocRef = doc(database, "userInfo", screenUserId);
    const loggedInuserDocRef = doc(database, "userInfo", user.uid);
    const loggedInUserDoc = await getDoc(loggedInuserDocRef);
    let screenUserfollowersArray = userInfo.followers || [];
    let loggedInUserfollowingArray = loggedInUserDoc.data().following || [];
    if (!following) {
      // if not already following
      // update the members followers array
      screenUserfollowersArray.push(user.uid);
      await updateDoc(screenUserDocRef, {
        followers: screenUserfollowersArray,
      });
      // update the users following array
      loggedInUserfollowingArray.push(screenUserId);
      await updateDoc(loggedInuserDocRef, {
        following: loggedInUserfollowingArray,
      });
      // set following stateVariable
      setFollowing(true);
    } else {
      // if following, unfollow
      // update the members followers array
      screenUserfollowersArray.splice(screenUserfollowersArray.indexOf(user.uid), 1);
      await updateDoc(screenUserDocRef, {
        followers: screenUserfollowersArray,
      });
      // update the users following array
      loggedInUserfollowingArray.splice(loggedInUserfollowingArray.indexOf(screenUserId), 1);
      await updateDoc(loggedInuserDocRef, {
        following: loggedInUserfollowingArray,
      });
      // set following stateVariable
      setFollowing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const id = navigation.getState().routes[1].params.id;
      setScreenUserId(id);
      const docRef = doc(database, "userInfo", id);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();
      navigation.setOptions({
        headerTitle: () => <Text style={styles.headerTitle}>{docData.username}</Text>,
      });
      setUserInfo(docData);
      const downmloadUrl = await getDownloadURL(ref(storage, id + ".png")).catch(() => undefined);
      setImageUrl(downmloadUrl);
      setFollowing(docData.followers ? docData.followers.indexOf(user.uid) > -1 : false);
      const posts = await getDocs(query(collection(database, "Posts"), where("authorId", "==", id)));
      setAmountOfPosts(posts.size);
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.profileInfo}>
          <Image
            source={imageUrl ? { uri: imageUrl } : require("../assets/icons/default_pfp.png")}
            style={styles.profilePicture}
          />
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
        <Text>{userInfo.name && userInfo.name}</Text>
        <Text style={{ marginBottom: 5 }}>{userInfo.biografy && userInfo.biografy}</Text>
        {following ? (
          <View style={styles.buttonContainer}>
            <View style={styles.innerButtonContainer}>
              <Button
                style={styles.editProfileButton}
                onPress={() => {
                  handleFollow();
                }}
                title="Unfollow"
              />
              <Button
                style={styles.editProfileButton}
                onPress={() => {
                  navigation.navigate("Private Message Component", { id: screenUserId });
                }}
                title="Send message"
              />
            </View>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <View style={{ width: "50%" }}>
              <Button
                style={styles.editProfileButton}
                onPress={() => {
                  handleFollow();
                }}
                title="Follow"
              />
            </View>
          </View>
        )}
      </View>
      <HeightContext.Provider value={{ value, setValue }}>
        <View style={{ height: value, width: "100%" }}>{ProfilePosts(navigation.getState().routes[1].params.id)}</View>
      </HeightContext.Provider>
    </ScrollView>
  );
}

export default MemberProfileScreen

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  profileInfo: {
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
  buttonContainer: {
    flexDirection: "row", 
    justifyContent: 'center',
    marginTop: 20,
  },
  innerButtonContainer: {
    flexDirection: "row", 
    justifyContent: 'space-evenly', 
    width: '80%'
  }
})