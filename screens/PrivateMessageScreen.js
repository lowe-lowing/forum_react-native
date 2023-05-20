import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { collection, doc, Firestore, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { auth, database } from "../firebase";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const MessageComponent = (props) => (
  <>
    <TouchableOpacity
      style={styles.messageComponent}
      onPress={() => {
        props.nav.navigate("Private Message Component", { id: props.id });
      }}
    >
      <Image
        source={props.img ? { uri: props.img } : require("../assets/icons/default_pfp.png")}
        style={styles.messageComponentImage}
      />
      <View style={styles.texts}>
        <Text style={styles.messageComponentText}>{props.name}</Text>
        <Text style={styles.lastmessage}>{props.lastmessage}</Text>
      </View>
    </TouchableOpacity>
  </>
);

const PrivateMessageScreen = () => {
  const [messageArray, setMessageArray] = useState([]);

  const navigation = useNavigation();
  const user = auth.currentUser;

  const getPrivateConversations = () => {
    const currentUserdocRef = doc(database, "userInfo", user.uid);
    getDoc(currentUserdocRef).then((currentUser) => {
      var relationsArray = currentUser.data().followers.concat(currentUser.data().following).unique();
      // gets all the followers and following of the current user in aunique array
      getDocs(collection(database, "userInfo")).then(async (response) => {
        let tempArray = [];
        let connectionArray = [];
        let docArray = [];

        response.forEach((doc) => {
          if (doc.id !== user.uid && relationsArray.includes(doc.id)) {
            connectionArray.push([user.uid + doc.id, doc.id + user.uid]);
            docArray.push(doc);
          }
        });

        await Promise.all(
          connectionArray.map(async (connection, i) => {
            const q = query(
              collection(database, "Messages"),
              where("connection", "in", connection),
              orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const latestMessage = querySnapshot.docs[0]?.data()?.message || null;
            tempArray.push(
              <MessageComponent
                key={`${connection[0]}_${connection[1]}`}
                name={docArray[i].data().name}
                lastmessage={latestMessage || "No messages yet"}
                img={docArray[i].data().pfp}
                id={docArray[i].id}
                nav={navigation}
              />
            );
          })
        );

        setMessageArray(tempArray);
      });
    });
  };

  useEffect(() => {
    getPrivateConversations();
    return getPrivateConversations;
  }, []);

  return (
    <View>
      {messageArray}
      <View style={styles.textContainer}>
        <Text style={styles.infoText}>Here you can chat with people you follow or is following you.</Text>
      </View>
    </View>
  );
};

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