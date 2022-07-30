import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { auth, database, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
    const user = auth.currentUser
    const navigation = useNavigation()

    const [nameInput, setNameInput] = useState()
    const [bioInput, setBioInput] = useState()

    async function updateProfileInfo(nameg, biografyg) {
        const oldName = user.displayName
        const docRef = doc(database, "userInfo", user.uid); 
        // TODO: kanske kolla så att om name och bio inte har ändrats så ska den inte updatera
        await updateDoc(docRef, {
            name: nameg,
            biografy: biografyg
        }).catch(err => console.log(err));
        navigation.navigate(oldName || "username")
    }
    function navSetOptions(name, biografy) {
        navigation.setOptions(({
            headerRight: () => 
            <TouchableOpacity onPress={() => {updateProfileInfo(name, biografy)}}>
                <Image source={require("../assets/icons/done.png")} style={{width: 30, height: 30}} />
            </TouchableOpacity>
        }))
    }
    const [imageUri, setImageUri] = useState(null);

    const changePfp = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.cancelled) {
        const response = await fetch(result.uri);
        const blob = await response.blob();
        const fileRef = ref(storage, user.uid + ".png");
        const metadata = {
            contentType: 'image/png',
        };
        await uploadBytes(fileRef, blob, metadata)
        const imageUrl = await getDownloadURL(fileRef)
        await updateProfile(user, {
            photoURL: imageUrl
        }) 
        setImageUri(imageUrl)
      }
    };
    useEffect(() => {
        const func = async () => {
            const docRef = doc(database, "userInfo", user.uid);
            const docSnap = await getDoc(docRef);
            setNameInput(docSnap.data().name)
            setBioInput(docSnap.data().biografy)
          }
        func()
        const unsub = () => {
            setImageUri(user.photoURL)
            navigation.setOptions(({
                headerRight: () => 
                <TouchableOpacity onPress={() => navigation.navigate(user.displayName)}>
                    <Image source={require("../assets/icons/done.png")} style={{width: 30, height: 30}} />
                </TouchableOpacity>
            }))
        }
        return unsub()
      }, [navigation, setImageUri]);
    //   if looks like this [navigation, nameInput], useEffect calls everytime nameInput changes

    return (
        <View style={styles.container}>
            <View style={styles.pfpContainer}>
                <View style={{flexDirection: "column" , alignItems: "center"}}>
                    <Image source={imageUri?{uri:imageUri}:require("../assets/icons/default_pfp.png")} style={styles.profilePicture} />
                    <TouchableOpacity onPress={changePfp}>
                        <Text style={styles.changePfpButton}>Change profile picture</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text>Name</Text>
            <TextInput
                value={nameInput}
                onChangeText={text => {
                    setNameInput(text)
                    navSetOptions(text, bioInput)
                }}
                style={styles.input}
            />
            <Text>Biografy</Text>
            <TextInput
                value={bioInput}
                onChangeText={text => {
                    setBioInput(text)
                    navSetOptions(nameInput, text)
                }}
                style={styles.input}
            />
        </View>
    )
}

export default EditProfileScreen

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    pfpContainer: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    profilePicture: {
        marginTop: 10,
        marginBottom: 10,
        height: 100,
        width: 100,
        borderRadius: 100
    },
    changePfpButton: {
        color: 'mediumturquoise',
        marginBottom: 10
    },
    input: {
        width: '100%',
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
    }
})