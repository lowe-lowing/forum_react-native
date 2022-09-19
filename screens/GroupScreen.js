import { Image, ShadowPropTypesIOS, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { auth, database } from '../firebase'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

const GroupComponent = (props) => (
  <>
    <TouchableOpacity style={styles.messageComponent} onPress={()=>{props.nav.navigate("Group Room", {id: props.id})}}>
        <Image source={require("../assets/icons/group.png")} style={styles.messageComponentImage} />
          <View style={{flexDirection: "column"}}>
              <Text style={styles.messageComponentText}>{props.name}</Text>
              <Text style={styles.usernameText}>
                { props.members.map((member, i) => {
                  return member.id!=auth.currentUser.uid && (
                    member.name + (i+1!=props.members.length ? ", ":"")
                  )})}
              </Text>
          </View>
    </TouchableOpacity>
  </>
)

const GroupScreen = () => {
  const [groups, setGroups] = useState([])
  const navigation = useNavigation()

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = async () => {
        const user = auth.currentUser
        const docs = await getDocs(collection(database, "Groups"))
        let tempArray = []
        docs.forEach(doc => {
          let valid = false
          doc.data().members.forEach(member => {
            if (member.id == user.uid) {valid = true}
          })
          if (valid) {
            tempArray.push(
              <GroupComponent 
                key={doc.id} 
                name={doc.data().name}
                members={doc.data().members} 
                id={doc.id}
                nav={navigation} />
            ) 
          }
        });
        setGroups(tempArray)
      }
      unsubscribe()
  
      return unsubscribe
    },[])
  )
  return (
    <View>
      {groups}
    </View>
  )
}

export default GroupScreen

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
  },
  messageComponentText: {
      fontSize: 16,
      fontWeight: 'bold',
  },
})