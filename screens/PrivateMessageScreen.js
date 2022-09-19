import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { collection, doc, Firestore, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, database } from '../firebase';

const MessageComponent = props => (
  <>
  <TouchableOpacity style={styles.messageComponent} onPress={() => {
      props.nav.navigate("Private Message Component", {id: props.id})
    }}
    >
      <Image source={props.img?{uri:props.img}:require("../assets/icons/default_pfp.png")} style={styles.messageComponentImage} />
      <View style={styles.texts}>
        <Text style={styles.messageComponentText}>{props.name}</Text>
        <Text style={styles.lastmessage}>{props.lastmessage}</Text>
      </View>
    </TouchableOpacity>
  </>
  )

const PrivateMessageScreen = () => {
  const [messageArray, setMessageArray] = useState([])

  const navigation = useNavigation()
  const user = auth.currentUser
  
  useEffect(() => {
    const unsubscribe = () => {
      const docRef = doc(database, "userInfo", user.uid);
      getDoc(docRef).then((res) => {
        var relationsArray = res.data().followers.concat(res.data().following).unique()
        getDocs(collection(database, "userInfo")).then((response) => {
          let tempArray = []
          response.forEach(doc => {
            if (doc.id != user.uid && relationsArray.includes(doc.id)) {
              tempArray.push(<MessageComponent key={doc.id} name={doc.data().name} lastmessage={'Tjena!'} img={doc.data().pfp} id={doc.id} nav={navigation}/>)
            }
          });
          setMessageArray(tempArray)
        });
      })
    };
    unsubscribe()

    return unsubscribe;
  }, []);

  return (
    <View>
      {messageArray}
      <View style={styles.textContainer}>
        <Text style={styles.infoText}>Here you can chat with people you follow or is following you.</Text>
      </View>
    </View>
  )
}

export default PrivateMessageScreen

Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }

  return a;
};

const styles = StyleSheet.create({
  messageComponent: {
    padding: 5,
    flexDirection: "row",
    alignItems: 'center',
    borderColor: 'grey',
    borderWidth: 1,
  },
  messageComponentImage: {
    width: 40, 
    height: 40,
    marginRight: 10,
    borderRadius: 50
  },
  messageComponentText: {
    fontSize: 19, 
    fontWeight: 'bold'
  },
  lastmessage: {
    fontSize:13, 
  },
  textContainer: { 
    marginTop: 30, 
    alignItems: 'center',
  },
  infoText: {
    fontSize: 20,
    fontWeight: '500'
  }
})