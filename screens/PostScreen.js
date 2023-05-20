import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore"; 
import { auth, database, storage } from "../firebase"
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const PostScreen = () => {
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [buttonDisabled, setButtonDisabled] = useState(true)

  const navigation = useNavigation()

  const addImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.cancelled) {
      setImageUrl(result.uri);
    }
  };

  const newPost = async () => {
    const user = auth.currentUser;
    try {
      setButtonDisabled(true);
      // post post
      const downmloadUrl = await getDownloadURL(ref(storage, user.uid + ".png")).catch(() => null);
      const docRef = await addDoc(collection(database, "Posts"), {
        authorUsername: user.displayName,
        authorId: user.uid,
        authorPfp: downmloadUrl,
        message: message,
        createdAt: serverTimestamp(),
      });
      console.log("post doc written with ID: ", docRef.id);
      if (imageUrl != null) {
        // upload image with the post id
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const fileRef = ref(storage, docRef.id + ".png");
        const metadata = {
          contentType: "image/png",
        };
        await uploadBytes(fileRef, blob, metadata);
        const downmloadUrl = await getDownloadURL(fileRef);
        // update post doc with photourl
        await updateDoc(docRef, {
          imageUrl: downmloadUrl,
        });
      }
      navigation.navigate("Feed");
    } catch (e) {
      console.error("Error adding document: ", e);
      setButtonDisabled(false);
    }
  };
  
  return (
    <View style={styles.firstContainer}>
      <View style={styles.imageContainer}>
      <ImageBackground source={require('../assets/icon.png')}>
        <Image source={{uri: imageUrl}} style={styles.image} />
        <TouchableOpacity onPress={addImage} style={styles.button}>
          <Text style={{color: 'white', fontSize: 40}}>+</Text>
        </TouchableOpacity>
      </ImageBackground>
      </View>
      <View style={styles.secondContainer} >
        <TextInput
          placeholder="Send a message to the world"
          value={message}
          onChangeText={text => {
            setMessage(text)
            setButtonDisabled(text == "")
          }}
          style={styles.input}
          multiline={true}
        />
        <TouchableOpacity onPress={newPost} style={!buttonDisabled?styles.uploadButton:styles.uploadButtonDisabled} disabled={buttonDisabled}>
          <Text style={{color: 'white', fontSize: 20}}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PostScreen

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    alignItems: 'center',
  },
  secondContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    height: '60%',
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: 80,
    marginBottom: 20,
  },
  button: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#0782F9',
    paddingHorizontal: 15,
    borderRadius: 50,
  },
  uploadButton: {
    backgroundColor: '#0782F9',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: 'lightgray',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  }
})