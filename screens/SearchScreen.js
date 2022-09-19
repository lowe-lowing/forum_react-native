import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { auth, database } from '../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useNavigation } from '@react-navigation/native'

const UserComponent = props => (
  <>
    <TouchableOpacity style={styles.messageComponent} onPress={() => {
      props.nav.navigate("Member Profile", {id: props.id})
    }}
    >
      <Image source={props.img?{uri:props.img}:require("../assets/icons/default_pfp.png")} style={styles.messageComponentImage} />
      <View>
        <Text style={styles.messageComponentText}>{props.name}</Text>
        <Text style={styles.lastmessage}>{props.username}</Text>
      </View>
    </TouchableOpacity>
  </>
)

const SearchScreen = ({navigation}) => {
  const [allusers, setAllusers] = useState({})
  const [foundUsers, setFoundUsers] = useState([])

  // const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = async () => {
      const docs = await getDocs(collection(database, "userInfo"))
      setAllusers(docs)
    }
    unsubscribe()
  
    return unsubscribe
  }, [navigation])
  
  const searchUsers = (searchParam) => {
    const array = allusers
    let tempArray = []
    array.forEach(user => {
      const data = user.data()
      const id = user.id
      if (data.username.includes(searchParam) && id != auth.currentUser.uid) {
        tempArray.push(<UserComponent key={id} name={data.name} username={data.username} id={id} nav={navigation} img={data.pfp} />)
      }
    });
    setFoundUsers(tempArray)
  }

  return (
    <View>
      <View style={styles.searchBox}>
        <Image source={require("../assets/icons/search.png")} style={styles.searchIcon}/>
        <TextInput
          placeholder="Search"
          onChangeText={searchParam => {
            if (searchParam != "") {
              searchUsers(searchParam) 
            }
          }}
          style={styles.input}
        />
      </View>
      {foundUsers}
    </View>
  )
}

export default SearchScreen

const styles = StyleSheet.create({
    searchBox: {
        margin: 10,
        borderRadius: 10,
        padding: 5,
        paddingRight: 20,
        backgroundColor: 'lightgray',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        width: 13,
        height: 13,
        marginRight: 12,
        marginLeft: 10,
    },
    input: {
        width: '90%',
        marginBottom: 2,
        height: 30
    },
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
})